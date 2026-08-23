using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using SqlOnAir.DotNet.Lib.DataClasses;

namespace EffortlessEntityFrameworkRunner;

/// <summary>
/// effortless-entity-framework substrate test runner.
///
/// Two-phase, single-context design:
///   1. LOAD: walk every testing/blank-tests/*.json into one shared in-memory
///      SoAEFContext. Scalar fields apply directly; string ids (PKs + FKs)
///      hash to deterministic Guids so navigation-property getters can
///      resolve cross-entity references.
///   2. RESOLVE: attach the context to every entity, hand-compute the
///      aggregations the transpiler doesn't yet emit (CountOfEmployees,
///      CountOfProjects), then read every property — calculated fields
///      ride on .NET property-getter semantics for free — and write
///      test-answers/{entity}.json with original string ids restored.
/// </summary>
public static class Program
{
    private static readonly Dictionary<Guid, string> GuidToString = new();

    public static int Main(string[] args)
    {
        var scriptDir = AppContext.BaseDirectory;
        var substrateDir = FindAncestorContaining(scriptDir, "Program.cs")
            ?? throw new InvalidOperationException("Cannot locate substrate directory.");
        var projectRoot = Path.GetFullPath(Path.Combine(substrateDir, "..", ".."));
        var erbTestingDir = Environment.GetEnvironmentVariable("ERB_TESTING_DIR");
        var testingDir = string.IsNullOrEmpty(erbTestingDir)
            ? Path.Combine(projectRoot, "testing")
            : erbTestingDir;
        var blankTestsDir = Path.Combine(testingDir, "blank-tests");
        var substrateName = Path.GetFileName(substrateDir.TrimEnd(Path.DirectorySeparatorChar));
        var testAnswersDir = string.IsNullOrEmpty(erbTestingDir)
            ? Path.Combine(substrateDir, "test-answers")
            : Path.Combine(erbTestingDir, substrateName, "test-answers");
        Directory.CreateDirectory(testAnswersDir);

        Console.WriteLine("Effortless-EntityFramework Substrate Test Runner");
        Console.WriteLine(new string('=', 50));
        Console.WriteLine();

        var ctx = new SoAEFContext();
        var entityTypes = DiscoverEntityTypes();
        Console.WriteLine($"Discovered {entityTypes.Count} EF entity classes:");
        foreach (var t in entityTypes) Console.WriteLine($"  - {t.Name}");
        Console.WriteLine();

        // ---------- PHASE 1: LOAD ----------
        // file -> ordered list of (entityInstance, original raw record) so we
        // can emit answers in the same order as the input.
        var fileBuckets = new List<(string fileName, Type entityType, List<(object instance, Dictionary<string, JsonElement> raw)> records)>();

        foreach (var blankFile in Directory.GetFiles(blankTestsDir, "*.json").OrderBy(p => p))
        {
            var fileName = Path.GetFileName(blankFile);
            if (fileName.StartsWith("_")) continue;
            var entityName = Path.GetFileNameWithoutExtension(fileName);

            var entityType = MatchEntityType(entityName, entityTypes);
            if (entityType == null)
            {
                Console.WriteLine($"  Skipping {entityName} (no matching dataclass)");
                continue;
            }

            var inputJson = File.ReadAllText(blankFile);
            var rawRecords = JsonSerializer.Deserialize<List<Dictionary<string, JsonElement>>>(inputJson)!;

            var bucket = new List<(object, Dictionary<string, JsonElement>)>();
            foreach (var record in rawRecords)
            {
                var instance = Activator.CreateInstance(entityType)!;
                ApplyRecordToInstance(instance, entityType, record);
                AddToContext(ctx, entityType, instance);
                bucket.Add((instance, record));
            }
            fileBuckets.Add((fileName, entityType, bucket));
            Console.WriteLine($"  loaded {entityName} ({entityType.Name}): {bucket.Count} records");
        }

        // ---------- PHASE 2: RESOLVE ----------
        // Attach context to every loaded entity (direct property set — skip
        // SoAEntityBase.SetContext's LazyLoad/guard so we don't trigger
        // navigation reads before all collections are populated).
        foreach (var (_, type, records) in fileBuckets)
        {
            foreach (var (instance, _) in records)
            {
                ((SoAEntityBase)instance).Context = ctx;
            }
        }

        // Cross-entity aggregations (CountOfX / SumOfX) that the EF transpiler
        // does not yet emit must be hand-computed by the substrate. They used
        // to be hardcoded here for one specific rulebook (Role/Employee/
        // Project/TypesOfProject); the field-level conformance harness now
        // catches missing aggregations as scored failures, so we leave them
        // null rather than baking entity-specific code into this runner.
        // (TODO: push back into the EF transpiler — these should be formula
        //  getters like the lookups, not auto-properties.)

        // Emit answers.
        int totalRecords = 0, totalEntities = 0;
        foreach (var (fileName, type, records) in fileBuckets)
        {
            var outRecords = new List<Dictionary<string, object?>>();
            foreach (var (instance, raw) in records)
            {
                outRecords.Add(ExtractAllProperties(instance, type, raw));
            }
            var outPath = Path.Combine(testAnswersDir, fileName);
            var outJson = JsonSerializer.Serialize(outRecords, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(outPath, outJson);
            Console.WriteLine($"  -> {Path.GetFileNameWithoutExtension(fileName)} ({type.Name}): {outRecords.Count} records");
            totalRecords += outRecords.Count;
            totalEntities++;
        }

        Console.WriteLine();
        Console.WriteLine($"effortless-entity-framework: Processed {totalEntities} entities, {totalRecords} total records");
        return 0;
    }

    // ------------------------------------------------------------------
    // Discovery + matching
    // ------------------------------------------------------------------

    private static List<Type> DiscoverEntityTypes()
    {
        return Assembly.GetExecutingAssembly()
            .GetTypes()
            .Where(t => typeof(SoAEntityBase).IsAssignableFrom(t)
                        && !t.IsAbstract
                        && t.Namespace == "SqlOnAir.DotNet.Lib.DataClasses")
            .ToList();
    }

    private static Type? MatchEntityType(string entityName, List<Type> entityTypes)
    {
        string norm = entityName.Replace("_", "").ToLowerInvariant();
        var candidates = new List<string> { norm };
        if (norm.EndsWith("ies")) candidates.Add(norm[..^3] + "y");
        else if (norm.EndsWith("s")) candidates.Add(norm[..^1]);
        // types_of_project -> typesofproject; the dataclass is TypesOfProject
        // (already singular as a unit) so the candidate set already matches.

        foreach (var t in entityTypes)
        {
            var tn = t.Name.ToLowerInvariant();
            if (candidates.Contains(tn)) return t;
        }
        return null;
    }

    private static string? FindAncestorContaining(string startDir, string fileName)
    {
        var dir = new DirectoryInfo(startDir);
        while (dir != null)
        {
            if (File.Exists(Path.Combine(dir.FullName, fileName))) return dir.FullName;
            dir = dir.Parent;
        }
        return null;
    }

    // ------------------------------------------------------------------
    // Field mapping
    // ------------------------------------------------------------------

    /// <summary>
    /// Hash an arbitrary string id (e.g. "mike-johnson") to a deterministic
    /// Guid so PK and FK references line up across files. Cached so the
    /// reverse map (Guid -> original string) survives the round trip.
    /// </summary>
    private static Guid StringToGuid(string id)
    {
        using var md5 = MD5.Create();
        var bytes = md5.ComputeHash(Encoding.UTF8.GetBytes(id));
        var guid = new Guid(bytes);
        GuidToString[guid] = id;
        return guid;
    }

    private static string ToSnakeCase(string pascal)
    {
        if (string.IsNullOrEmpty(pascal)) return pascal;
        var sb = new StringBuilder();
        for (int i = 0; i < pascal.Length; i++)
        {
            char c = pascal[i];
            if (char.IsUpper(c) && i > 0 && !char.IsUpper(pascal[i - 1]))
                sb.Append('_');
            sb.Append(char.ToLowerInvariant(c));
        }
        return sb.ToString();
    }

    private static void ApplyRecordToInstance(object instance, Type type, Dictionary<string, JsonElement> record)
    {
        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanWrite) continue;
            // Skip navigation properties (Role, ApprovedBy, ProjectType, ...).
            if (typeof(SoAEntityBase).IsAssignableFrom(prop.PropertyType)) continue;
            // Skip collections.
            if (prop.PropertyType.IsGenericType
                && (prop.PropertyType.GetGenericTypeDefinition() == typeof(ICollection<>)
                    || prop.PropertyType.GetGenericTypeDefinition() == typeof(IEnumerable<>)
                    || prop.PropertyType.GetGenericTypeDefinition().Name.StartsWith("ObservableCollection")))
                continue;

            var snake = ToSnakeCase(prop.Name);

            // Guid properties: PK (e.g. RoleId <- role_id) or FK (e.g.
            // RoleId <- role, ApprovedById <- approved_by).
            if (prop.PropertyType == typeof(Guid) || prop.PropertyType == typeof(Guid?))
            {
                string? src = null;
                if (record.TryGetValue(snake, out var je1) && je1.ValueKind == JsonValueKind.String)
                {
                    src = je1.GetString();
                }
                else if (snake.EndsWith("_id"))
                {
                    var navSnake = snake[..^3];
                    if (record.TryGetValue(navSnake, out var je2) && je2.ValueKind == JsonValueKind.String)
                    {
                        src = je2.GetString();
                    }
                }
                if (!string.IsNullOrEmpty(src))
                {
                    prop.SetValue(instance, StringToGuid(src));
                }
                continue;
            }

            if (!record.TryGetValue(snake, out var je)) continue;
            if (je.ValueKind == JsonValueKind.Null) continue;

            try
            {
                object? value = CoerceJson(je, prop.PropertyType);
                if (value != null) prop.SetValue(instance, value);
            }
            catch { /* leave unset */ }
        }
    }

    private static object? CoerceJson(JsonElement je, Type target)
    {
        if (target == typeof(string)) return je.ValueKind == JsonValueKind.String ? je.GetString() : je.ToString();
        if (target == typeof(int) || target == typeof(int?)) return je.GetInt32();
        if (target == typeof(long) || target == typeof(long?)) return je.GetInt64();
        if (target == typeof(double) || target == typeof(double?)) return je.GetDouble();
        if (target == typeof(decimal) || target == typeof(decimal?)) return je.GetDecimal();
        if (target == typeof(bool) || target == typeof(bool?)) return je.GetBoolean();
        if (target == typeof(DateTime) || target == typeof(DateTime?)) return je.GetDateTime();
        return null;
    }

    private static void AddToContext(SoAEFContext ctx, Type entityType, object instance)
    {
        // ctx.SetByType(t) — reflection-driven dispatch, no per-entity wiring.
        var set = ctx.SetByType(entityType);
        set.GetType().GetMethod("Add")!.Invoke(set, new[] { instance });
    }

    // ------------------------------------------------------------------
    // Extraction
    // ------------------------------------------------------------------

    private static Dictionary<string, object?> ExtractAllProperties(object instance, Type type, Dictionary<string, JsonElement> record)
    {
        var result = new Dictionary<string, object?>();

        // Start with the raw input keys so PKs / unmodeled fields stay verbatim.
        foreach (var kv in record)
        {
            result[kv.Key] = JsonElementToObject(kv.Value);
        }

        foreach (var prop in type.GetProperties(BindingFlags.Public | BindingFlags.Instance))
        {
            if (!prop.CanRead) continue;
            // Skip SDK plumbing inherited from SoAEntityBase.
            if (prop.DeclaringType == typeof(SoAEntityBase)) continue;
            // Skip navigation properties + collections.
            if (typeof(SoAEntityBase).IsAssignableFrom(prop.PropertyType)) continue;
            if (prop.PropertyType.IsGenericType)
            {
                var gd = prop.PropertyType.GetGenericTypeDefinition();
                if (gd == typeof(ICollection<>) || gd == typeof(IEnumerable<>)) continue;
                if (gd.Name.StartsWith("ObservableCollection")) continue;
            }

            var snake = ToSnakeCase(prop.Name);
            try
            {
                var value = prop.GetValue(instance);

                // Round-trip Guid PK/FK values back to the original string id.
                if (value is Guid g)
                {
                    if (GuidToString.TryGetValue(g, out var s)) result[snake] = s;
                    else if (g == Guid.Empty) result[snake] = null;
                    else result[snake] = g.ToString();
                    continue;
                }

                result[snake] = value;
            }
            catch { /* getter blew up; leave whatever was in raw */ }
        }

        return result;
    }

    private static object? JsonElementToObject(JsonElement je) => je.ValueKind switch
    {
        JsonValueKind.String => je.GetString(),
        JsonValueKind.Number => je.TryGetInt64(out var l) ? (object)l : je.GetDouble(),
        JsonValueKind.True => true,
        JsonValueKind.False => false,
        JsonValueKind.Null => null,
        _ => je.ToString(),
    };
}
