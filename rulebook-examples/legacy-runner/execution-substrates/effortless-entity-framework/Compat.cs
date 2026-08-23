// In-memory replacement for the EF Core SoAEFContext. The transpiler-emitted
// SoAEFContext.cs pulls in Microsoft.EntityFrameworkCore (DbContext / DbSet),
// which this substrate doesn't reference. We satisfy the generated dataclass
// surface (Context.Attach / AttachRange and per-entity .Find / .Where) with
// reflection-driven InMemorySet<T> buckets indexed by element type, so the
// runner works for ANY rulebook without per-entity wiring here.

using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace SqlOnAir.DotNet.Lib.DataClasses
{
    public sealed class InMemorySet<T> : IEnumerable<T> where T : class
    {
        private readonly List<T> _items = new();
        private readonly PropertyInfo? _keyProp;

        public InMemorySet()
        {
            _keyProp = typeof(T)
                .GetProperties(BindingFlags.Public | BindingFlags.Instance)
                .FirstOrDefault(p => p.PropertyType == typeof(Guid)
                                     && p.GetCustomAttributes(typeof(System.ComponentModel.DataAnnotations.KeyAttribute), true).Any());
        }

        public void Add(T item) => _items.Add(item);
        public IReadOnlyList<T> AsReadOnly() => _items;

        public T? Find(Guid id)
        {
            if (_keyProp == null) return null;
            foreach (var item in _items)
            {
                if ((Guid)_keyProp.GetValue(item)! == id) return item;
            }
            return null;
        }

        public IEnumerator<T> GetEnumerator() => _items.GetEnumerator();
        IEnumerator IEnumerable.GetEnumerator() => _items.GetEnumerator();
    }

    /// <summary>
    /// Rulebook-agnostic in-memory stand-in for the EF Core context. Entity
    /// buckets are looked up by runtime type so this file does not need to
    /// list specific entities — adding/removing entities in the rulebook does
    /// not require any code change here.
    /// </summary>
    public class SoAEFContext
    {
        public static bool ThrowErrorOnContextMissing { get; set; } = false;

        private readonly Dictionary<Type, object> _sets = new();

        public InMemorySet<T> Set<T>() where T : class
        {
            if (!_sets.TryGetValue(typeof(T), out var set))
            {
                set = new InMemorySet<T>();
                _sets[typeof(T)] = set;
            }
            return (InMemorySet<T>)set;
        }

        public object SetByType(Type t)
        {
            if (!_sets.TryGetValue(t, out var set))
            {
                var setType = typeof(InMemorySet<>).MakeGenericType(t);
                set = Activator.CreateInstance(setType)!;
                _sets[t] = set;
            }
            return set;
        }

        public IEnumerable<object> AllEntities()
        {
            foreach (var s in _sets.Values)
            {
                foreach (var e in (IEnumerable)s) yield return e;
            }
        }

        public void Attach(object _) { /* no-op: entities are already in-memory */ }
        public void AttachRange(IEnumerable<object> _) { /* no-op */ }
    }
}
