# 📘 veritasium-power-laws-and-fractals — RuleSpeak®

_Unifies several classic fractal / power-law phenomena into a single CMCC pattern with clean separation between fractal dimension and log–log slope._

> Declarative business rules rendered from the rulebook. Every statement
> below expresses truth in the business domain — it is neither a procedure
> nor an imperative. The rulebook's formulas are the single source of truth;
> this document is their plain-language reading.

## 1 Business Vocabulary

| Term | Description | Narrative Comment |
|------|-------------|-------------------|
| **system** | Each row is a fractal or power-law system described in a common schema. | — |
| Display Name | A defined attribute. | _Human readable label._ |
| Class | A defined attribute. | _High-level class: 'fractal' or 'power_law'._ |
| Base Scale | A defined attribute. | _Reference scale x0 for iteration 0._ |
| Scale Factor | A defined attribute. | _Multiplicative change in scale per iteration._ |
| Measure Name | A defined attribute. | _What the measured quantity represents (count, perimeter, frequency, etc.)._ |
| Fractal Dimension | A defined attribute. | _Fractal (Hausdorff / similarity) dimension where defined (geometric fractals). Null for purely statistical laws._ |
| Theoretical Log Log Slope | A defined attribute. | _Theoretical slope d(log Measure)/d(log Scale) for this system under the chosen definition of Scale._ |
| Empirical Fit Quality | The r2 of the system's system ID. | _R² value from fitted model showing how well observed data fits theory._ |
| Empirical Slope Deviation | Computed as the absolute value of the slope delta of the system's system ID. | _Absolute magnitude of slope error from fitted observations._ |
| Measurement Noise Level | The noise sigma of the system's system ID. | _Noise sigma parameter from measurement model for this system._ |
| Data Quality Score | Computed as the empirical fit quality times 1 minus the empirical slope deviation. | _Composite quality metric combining fit quality and slope accuracy._ |
| Relative Slope Error | Computed as the slope delta of the system's system ID divided by the theoretical log log slope. | _Slope deviation as a fraction of theoretical slope (percentage error)._ |
| Is High Quality Fit | True when all of the following hold: the empirical fit quality is greater than 0.99 and the empirical slope deviation is less than 0.05. | _Boolean flag indicating excellent fit (R² > 0.99 and slope error < 0.05)._ |
| Scale Range Span | The delta log scale of the system's system ID. | _Total span in log-scale space covered by data (decades of scale)._ |
| Measure Range Span | The delta log measure of the system's system ID. | _Total span in log-measure space covered by data (decades of measure)._ |
| **scale** | Generic log–log points for each system at multiple iterations / scales. | — |
| System | A defined attribute. | _FK to systems table._ |
| Iteration | A defined attribute. | _Discrete zoom level or rank index._ |
| Measure | A defined attribute. | _Y-axis measured quantity at this scale._ |
| Base Scale | Taken from the linked system. | _Base scale looked up from parent system._ |
| Scale Factor | Taken from the linked system. | _Scale factor looked up from parent system._ |
| Scale Factor Power | Computed as the scale factor raised to the power of the iteration. | _ScaleFactor raised to the Iteration power._ |
| Scale | Computed as the base scale times the scale factor power. | _X-axis variable: BaseScale multiplied by ScaleFactorPower._ |
| Log Scale | Computed as the LOG10 of the scale. | _log10 of Scale._ |
| Log Measure | Computed as the LOG10 of the measure. | _log10 of Measure._ |
| Is Projected | True when an empty string. | _True if this data point is a projection/estimate rather than measured data._ |
| Data Regime | A defined attribute. | _Data regime for this point: 'ideal' (constructed/projection) or 'measured' (noisy real-world measurement)._ |
| Measurement Model | A defined attribute. | _Optional FK to measurement_models describing noise/cutoff/discretization used to generate or interpret this point._ |
| Theoretical Log Log Slope | Taken from the linked system. | _Theoretical slope from parent system for comparison._ |
| Empirical Log Log Slope | Taken from the linked system. | _Empirical slope from system_stats for residual calculation._ |
| System Min Log Scale | Taken from the linked system. | _Minimum log scale for the system (for normalization)._ |
| System Max Log Scale | Taken from the linked system. | _Maximum log scale for the system (for normalization)._ |
| System Delta Log Scale | Taken from the linked system. | _Total log scale range for the system._ |
| Scale Ratio | Determined by priority: 0 if the base scale is 0; in all other cases, the scale divided by the base scale. | _How many times larger than base scale (multiplicative factor). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Log Scale Normalized | Determined by priority: 0 if the system delta log scale is 0; in all other cases, the log scale minus the system min log scale divided by the system delta log scale. | _Position within system's log-scale range as 0-1 value. Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| **system stat** | Statistical analysis of each system's log-log behavior, with rollups from scales and lookups to systems. | — |
| System | A defined attribute. | _FK to systems table._ |
| Analysis Name | A defined attribute. | _Human-readable name for this analysis run._ |
| Status | A defined attribute. | _Status of analysis: draft, validated, published._ |
| System Display Name | Taken from the linked system. | _Display name looked up from parent system._ |
| Theoretical Log Log Slope | Taken from the linked system. | _Theoretical slope looked up from parent system._ |
| Point Count | The number of scales related to the system stat. | _Rollup: Count of scale measurements for this system._ |
| Min Log Scale | The smallest log scale across the scales related to the system stat. | _Rollup: Minimum log10(Scale) across child scales._ |
| Max Log Scale | The largest log scale across the scales related to the system stat. | _Rollup: Maximum log10(Scale) across child scales._ |
| Min Log Measure | The smallest log measure across the scales related to the system stat. | _Rollup: Minimum log10(Measure) across child scales._ |
| Max Log Measure | The largest log measure across the scales related to the system stat. | _Rollup: Maximum log10(Measure) across child scales._ |
| Delta Log Measure | Computed as the min log measure minus the max log measure. | _Calculated: Difference between min and max log measure (numerator for slope)._ |
| Delta Log Scale | Computed as the max log scale minus the min log scale. | _Calculated: Difference between max and min log scale (denominator for slope)._ |
| Empirical Log Log Slope | Determined by priority: 0 if the delta log scale is 0; in all other cases, the delta log measure divided by the delta log scale. | _Calculated: Slope of log-log line from empirical data. Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Slope Error | Computed as the empirical log log slope minus the theoretical log log slope. | _Calculated: Difference between empirical and theoretical slopes._ |
| Fitted Slope | Taken from the linked system. | _Fitted slope from inference_runs on observed data._ |
| Fitted Vs Empirical Delta | Computed as the fitted slope minus the empirical log log slope. | _Difference between fitted slope (noisy obs) and empirical slope (ideal data)._ |
| R2 | The r2 of the system stat's system. | _R² fit quality from inference_runs._ |
| Quality Weighted Slope | Computed as the r2 times the fitted slope. | _Fitted slope weighted by confidence (R²)._ |
| Residual RMS | Taken from the linked system. | _RMS residual from fitted model._ |
| Noise Sigma | Taken from the linked system. | _Noise level parameter from measurement model._ |
| Slope to Noise Ratio | Determined by priority: 0 if the noise sigma is 0; in all other cases, the absolute value of the empirical log log slope divided by the noise sigma. | _Signal-to-noise ratio (slope magnitude vs. noise level). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Deviation Score | Taken from the linked system. | _Composite error metric from inference_runs._ |
| Abs Delta Log Measure | Computed as the absolute value of the delta log measure. | _Absolute value of delta log measure._ |
| Log Log Area | Computed as the delta log scale times the abs delta log measure. | _Area in log-log space (product of ranges)._ |
| Data Density | Determined by priority: 0 if the log log area is 0; in all other cases, the point count divided by the log log area. | _Number of data points per unit area in log-log space. Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Relative Slope Error | Determined by priority: 0 if the theoretical log log slope is 0; in all other cases, the slope error divided by the theoretical log log slope. | _Slope error as fraction of theoretical slope (percentage). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| **measurement model** | Measurement/de-idealization specs used to produce or interpret real-world (noisy, finite-size, discretized) scale records. | — |
| System | A defined attribute. | _FK to systems table (measurement model is typically system-specific)._ |
| Data Regime | A defined attribute. | _Regime this model describes. Usually 'measured'._ |
| Scale Regime | A defined attribute. | _Optional RegimeID this measurement model applies to_ |
| Noise Type | A defined attribute. | _Noise model applied to measures (e.g., lognormal multiplicative)._ |
| Noise Sigma | A defined attribute. | _Noise strength parameter (e.g., sigma in log space for lognormal)._ |
| Cutoff Min Scale | A defined attribute. | _Minimum scale included (finite-size / censoring lower bound)._ |
| Cutoff Max Scale | A defined attribute. | _Maximum scale included (finite-size / censoring upper bound)._ |
| Discretization Type | A defined attribute. | _How observations are discretized (none, rounding, binning, log-binning)._ |
| Discretization Param | A defined attribute. | _Parameterization of discretization (e.g., decimals=2 or binwidth=log2)._ |
| Mean Absolute Residual | The average abs residual across the observed scales related to the measurement model. | _Average absolute residual from fitted model for observations using this model._ |
| Outlier Count | The number of the measurement model's observed scales that are outliers. | _Number of outlier points (\|standardized residual\| > 2.5) in observed_scales._ |
| Total Point Count | The number of observed scales related to the measurement model. | _Total number of observed data points using this measurement model._ |
| Outlier Rate | Determined by priority: 0 if the total point count is 0; in all other cases, the outlier count divided by the total point count. | _Fraction of points that are outliers (quality metric). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Effective Point Count | Computed as the total point count minus the outlier count. | _Number of non-outlier points (usable for analysis)._ |
| Residual RMS From Inference | Taken from the linked system. | _RMS residual from inference_runs (total fit error)._ |
| Cutoff Log Min Scale | Computed as the LOG10 of the cutoff min scale. | _Log10 of minimum cutoff scale._ |
| Cutoff Log Max Scale | Computed as the LOG10 of the cutoff max scale. | _Log10 of maximum cutoff scale._ |
| Cutoff Range Span | Computed as the cutoff log max scale minus the cutoff log min scale. | _Range of observable scales in log units (decades)._ |
| **observed scale** | Noisy, finite-range, discretized observations of each system's scaling law. Mirrors scales but with DataRegime='measured'. | — |
| System | A defined attribute. | _FK to systems table._ |
| Measurement Model | A defined attribute. | _FK to measurement model used/assumed for this observation set._ |
| Iteration | A defined attribute. | _Discrete zoom level or rank index._ |
| Measure | A defined attribute. | _Observed (noisy) Y-axis quantity at this scale._ |
| Base Scale | Taken from the linked system. | _Base scale looked up from parent system._ |
| Scale Factor | Taken from the linked system. | _Scale factor looked up from parent system._ |
| Scale Factor Power | Computed as the scale factor raised to the power of the iteration. | _ScaleFactor raised to the Iteration power._ |
| Scale | Computed as the base scale times the scale factor power. | _X-axis variable: BaseScale multiplied by ScaleFactorPower._ |
| Log Scale | Computed as the LOG10 of the scale. | _log10 of Scale._ |
| Log Measure | Computed as the LOG10 of the measure. | _log10 of Measure._ |
| Data Regime | A defined attribute. | _Data regime. For observed_scales this is 'measured'._ |
| Fitted Slope | Taken from the linked system. | _Fitted slope from inference_runs for this system._ |
| Fitted Intercept | Taken from the linked system. | _Fitted intercept from inference_runs for this system._ |
| Residual RMS | Taken from the linked system. | _RMS residual from fitted model (for standardization)._ |
| Predicted Log Measure | Computed as the fitted slope times the log scale plus the fitted intercept. | _Predicted log measure from fitted model._ |
| Residual | Computed as the log measure minus the predicted log measure. | _Vertical distance from fitted line in log-log space._ |
| Residual Squared | Computed as the residual times the residual. | _Squared residual for aggregation into RMS calculations._ |
| Standardized Residual | Determined by priority: 0 if the residual RMS is 0; in all other cases, the residual divided by the residual RMS. | _Residual in units of RMS (number of standard deviations). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Is Outlier | True when the absolute value of the standardized residual is greater than 2.5. | _Outlier detection flag (>2.5 RMS units from fit)._ |
| Scale Ratio | Determined by priority: 0 if the base scale is 0; in all other cases, the scale divided by the base scale. | _Scale relative to base scale (multiplicative factor). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Abs Residual | Computed as the absolute value of the residual. | _Absolute value of residual for aggregation._ |
| **inference run** | Inference outputs (fits and residual geometry) computed from observed_scales relative to each system fixed point. | — |
| System | A defined attribute. | _FK to systems table._ |
| Data Regime | A defined attribute. | _Regime of the fitted data (ideal/measured)._ |
| Measurement Model | A defined attribute. | _FK to measurement model used/assumed (nullable for ideal)._ |
| Fit Method | A defined attribute. | _Fitting method used (e.g., OLS on log-log)._ |
| Point Count | A defined attribute. | _Count of observed points used in fit (measured)._ |
| Theoretical Log Log Slope | A defined attribute. | _Fixed-point slope for the system._ |
| Fitted Slope | A defined attribute. | _Estimated slope from observed data under FitMethod._ |
| Fitted Intercept | A defined attribute. | _Estimated intercept in log10 space (logMeasure = intercept + slope*logScale)._ |
| Slope Delta | A defined attribute. | _Difference between fitted slope and fixed-point slope._ |
| R2 | A defined attribute. | _Coefficient of determination for the log-log fit._ |
| Residual RMS | A defined attribute. | _Root-mean-square residual in log10 space (vertical residuals)._ |
| Residual Max Abs | A defined attribute. | _Maximum absolute residual in log10 space._ |
| Orthogonal RMS | A defined attribute. | _RMS orthogonal distance to the fitted log-log line in (logScale, logMeasure) coordinates._ |
| Deviation Score | A defined attribute. | _Composite deviation score combining residual RMS and slope delta (units: log10 + slope)._ |
| Slope Confidence Interval | Determined by priority: 0 if the point count is 0; in all other cases, 1.96 times the residual RMS divided by the square root of the point count. | _Approximate 95% confidence interval for slope (simplified formula). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Min Log Scale | The smallest log scale across the observed scales related to the inference run. | _Minimum log scale in the observed data._ |
| Max Log Scale | The largest log scale across the observed scales related to the inference run. | _Maximum log scale in the observed data._ |
| Min Log Measure | The smallest log measure across the observed scales related to the inference run. | _Minimum log measure in the observed data._ |
| Max Log Measure | The largest log measure across the observed scales related to the inference run. | _Maximum log measure in the observed data._ |
| Log Measure Range | Computed as the max log measure minus the min log measure. | _Range of log measure values._ |
| Abs Slope Delta | Computed as the absolute value of the slope delta. | _Absolute value of slope delta._ |
| Slope is Significant | True when the abs slope delta is greater than the slope confidence interval. | _True if deviation from theory exceeds confidence interval (statistically significant)._ |
| One Plus Residual RMS | Computed as 1 plus the residual RMS. | _One plus residual RMS for efficiency calculation._ |
| Fit Efficiency | Determined by priority: 0 if the one plus residual RMS is 0; in all other cases, the r2 divided by the one plus residual RMS. | _Quality per unit error (higher is better). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Normalized RMSE | Determined by priority: 0 if the log measure range is 0; in all other cases, the residual RMS divided by the log measure range. | _RMSE as fraction of total log measure range. Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Slope to Theoretical Ratio | Determined by priority: 0 if the theoretical log log slope is 0; in all other cases, the fitted slope divided by the theoretical log log slope. | _Ratio of fitted to theoretical slope (1.0 = perfect match). Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| One Minus R2 | Computed as 1 minus the r2. | _One minus R² for adjusted R² calculation._ |
| Point Count Minus One | Computed as the point count minus 1. | _Point count minus one (degrees of freedom)._ |
| Point Count Minus Two | Computed as the point count minus 2. | _Point count minus two (degrees of freedom for regression)._ |
| Adjusted R2 | Determined by priority: 0 if the point count minus two is 0; in all other cases, 1 minus the one minus r2 times the point count minus one divided by the point count minus two. | _R² adjusted for degrees of freedom. Reads 0 when the denominator is 0 (the transpiler has no NULLIF)._ |
| Residual RMS Squared | Computed as the residual RMS times the residual RMS. | _Squared residual RMS for BIC calculation._ |
| Log Residual RMS Squared | Computed as the logarithm of the residual RMS squared. | _Log of squared residual RMS._ |
| Log Point Count | Computed as the logarithm of the point count. | _Natural log of point count._ |
| BIC | Computed as the point count times the log residual RMS squared plus 2 times the log point count. | _Bayesian Information Criterion (lower is better fit)._ |
| **scale regime** | Multi-regime analysis defining different scale ranges within systems where different slope behaviors may occur. | — |
| System | A defined attribute. | _FK to systems table._ |
| Min Log Scale | A defined attribute. | _Minimum log10(scale) boundary for this regime._ |
| Max Log Scale | A defined attribute. | _Maximum log10(scale) boundary for this regime._ |
| Expected Slope | A defined attribute. | _Expected log-log slope within this regime._ |
| Regime Type | A defined attribute. | _Type of regime: 'early_scaling', 'mature_scaling', 'crossover', 'cutoff', etc._ |
| Regime Span | Computed as the max log scale minus the min log scale. | _Width of regime in log-scale units (decades)._ |
| Regime Center | Computed as the min log scale plus the max log scale divided by 2. | _Midpoint of regime in log-scale._ |
| Theoretical Log Log Slope | Taken from the linked system. | _Global theoretical slope from parent system._ |
| Slope Deviation From Global | Computed as the expected slope minus the theoretical log log slope. | _Local expected slope deviation from global theoretical slope._ |
| Points in Regime | The number of scales related to the scale regime. | _Count of data points from scales table within this regime's range._ |

## 2 Fact Types

- a **scale** references exactly one **system**
- a **scale** references exactly one **measurement model**
- a **system stat** references exactly one **system**
- a **measurement model** references exactly one **system**
- an **observed scale** references exactly one **system**
- an **observed scale** references exactly one **measurement model**
- an **inference run** references exactly one **system**
- an **inference run** references exactly one **measurement model**
- a **scale regime** references exactly one **system**

## 3 Operative Rules

_Operative rules state what the business **obliges**, **prohibits**, or
advises (**should**). Structural rules come from required fields and foreign keys;
semantic rules come from the Constraints table, each keyed on a boolean the rulebook
already computes (cross-referenced as DR-N in the Definitional Rules below)._

### Structural Constraints (from the schema)

- A system **must** have a display name, a class, a base scale, a scale factor, a measure name, a fractal dimension, and a theoretical log log slope.
- A scale **must** reference exactly one system.
- A scale **must** reference exactly one measurement model.
- A scale **must** have an iteration, a measure, and a data regime, and record whether it is projected.
- A system stat **must** reference exactly one system.
- A system stat **must** have an analysis name and a status.
- A measurement model **must** reference exactly one system.
- A measurement model **must** have a data regime, a scale regime, a noise type, a noise sigma, a cutoff min scale, a cutoff max scale, a discretization type, and a discretization param.
- An observed scale **must** reference exactly one system.
- An observed scale **must** reference exactly one measurement model.
- An observed scale **must** have an iteration, a measure, and a data regime.
- An inference run **must** reference exactly one system.
- An inference run **must** reference exactly one measurement model.
- An inference run **must** have a data regime, a fit method, a point count, a theoretical log log slope, a fitted slope, a fitted intercept, a slope delta, a r2, a residual RMS, a residual max abs, an orthogonal RMS, and a deviation score.
- A scale regime **must** reference exactly one system.
- A scale regime **must** have a min log scale, a max log scale, an expected slope, and a regime type.

## 4 Definitional Rules

_All statements express truth in the business domain; they are neither
procedures nor imperatives. "iff" is avoided in favor of "only if" so a
one-directional necessity is not mistaken for an equivalence. A
**⚠︎ mechanical** chip marks a rule whose deterministic wording is faithful
but clunky — a flag for an optional downstream reword pass, not a defect._

| ID | Declarative rule |
|----|------------------|
| **DR-1 Empirical Fit Quality** | A system's empirical fit quality is the r2 of the system's system ID. |
| **DR-2 Empirical Slope Deviation** | A system's empirical slope deviation is computed as the absolute value of the slope delta of the system's system ID. |
| **DR-3 Measurement Noise Level** | A system's measurement noise level is the noise sigma of the system's system ID. |
| **DR-4 Data Quality Score** | A system's data quality score is computed as the empirical fit quality times 1 minus the empirical slope deviation. |
| **DR-5 Relative Slope Error** | A system's relative slope error is computed as the slope delta of the system's system ID divided by the theoretical log log slope. |
| **DR-6 Is High Quality Fit** | A system is considered a high quality fit if all of the following hold: the empirical fit quality is greater than 0.99 and the empirical slope deviation is less than 0.05. |
| **DR-7 Scale Range Span** | A system's scale range span is the delta log scale of the system's system ID. |
| **DR-8 Measure Range Span** | A system's measure range span is the delta log measure of the system's system ID. |
| **DR-9 Base Scale** | A scale's base scale — taken from the linked system. |
| **DR-10 Scale Factor** | A scale's scale factor — taken from the linked system. |
| **DR-11 Scale Factor Power** | A scale's scale factor power is computed as the scale factor raised to the power of the iteration. |
| **DR-12 Scale** | A scale's scale is computed as the base scale times the scale factor power. |
| **DR-13 Log Scale** | A scale's log scale is computed as the LOG10 of the scale. |
| **DR-14 Log Measure** | A scale's log measure is computed as the LOG10 of the measure. |
| **DR-15 Theoretical Log Log Slope** | A scale's theoretical log log slope — taken from the linked system. |
| **DR-16 Empirical Log Log Slope** | A scale's empirical log log slope — taken from the linked system. |
| **DR-17 System Min Log Scale** | A scale's system min log scale — taken from the linked system. |
| **DR-18 System Max Log Scale** | A scale's system max log scale — taken from the linked system. |
| **DR-19 System Delta Log Scale** | A scale's system delta log scale — taken from the linked system. |
| **DR-20 Scale Ratio** | The scale's scale ratio is determined by the following priority:<br>1. 0, if the base scale is 0;<br>2. in all other cases, the scale divided by the base scale. |
| **DR-21 Log Scale Normalized** | The scale's log scale normalized is determined by the following priority:<br>1. 0, if the system delta log scale is 0;<br>2. in all other cases, the log scale minus the system min log scale divided by the system delta log scale. |
| **DR-22 System Display Name** | A system stat's system display name — taken from the linked system. |
| **DR-23 Theoretical Log Log Slope** | A system stat's theoretical log log slope — taken from the linked system. |
| **DR-24 Point Count** | A system stat's point count is the number of scales related to the system stat. |
| **DR-25 Min Log Scale** | A system stat's min log scale is the smallest log scale across the scales related to the system stat. |
| **DR-26 Max Log Scale** | A system stat's max log scale is the largest log scale across the scales related to the system stat. |
| **DR-27 Min Log Measure** | A system stat's min log measure is the smallest log measure across the scales related to the system stat. |
| **DR-28 Max Log Measure** | A system stat's max log measure is the largest log measure across the scales related to the system stat. |
| **DR-29 Delta Log Measure** | A system stat's delta log measure is computed as the min log measure minus the max log measure. |
| **DR-30 Delta Log Scale** | A system stat's delta log scale is computed as the max log scale minus the min log scale. |
| **DR-31 Empirical Log Log Slope** | The system stat's empirical log log slope is determined by the following priority:<br>1. 0, if the delta log scale is 0;<br>2. in all other cases, the delta log measure divided by the delta log scale. |
| **DR-32 Slope Error** | A system stat's slope error is computed as the empirical log log slope minus the theoretical log log slope. |
| **DR-33 Fitted Slope** | A system stat's fitted slope — taken from the linked system. |
| **DR-34 Fitted Vs Empirical Delta** | A system stat's fitted vs empirical delta is computed as the fitted slope minus the empirical log log slope. |
| **DR-35 R2** | A system stat's r2 is the r2 of the system stat's system. |
| **DR-36 Quality Weighted Slope** | A system stat's quality weighted slope is computed as the r2 times the fitted slope. |
| **DR-37 Residual RMS** | A system stat's residual RMS — taken from the linked system. |
| **DR-38 Noise Sigma** | A system stat's noise sigma — taken from the linked system. |
| **DR-39 Slope to Noise Ratio** | The system stat's slope to noise ratio is determined by the following priority:<br>1. 0, if the noise sigma is 0;<br>2. in all other cases, the absolute value of the empirical log log slope divided by the noise sigma. |
| **DR-40 Deviation Score** | A system stat's deviation score — taken from the linked system. |
| **DR-41 Abs Delta Log Measure** | A system stat's abs delta log measure is computed as the absolute value of the delta log measure. |
| **DR-42 Log Log Area** | A system stat's log log area is computed as the delta log scale times the abs delta log measure. |
| **DR-43 Data Density** | The system stat's data density is determined by the following priority:<br>1. 0, if the log log area is 0;<br>2. in all other cases, the point count divided by the log log area. |
| **DR-44 Relative Slope Error** | The system stat's relative slope error is determined by the following priority:<br>1. 0, if the theoretical log log slope is 0;<br>2. in all other cases, the slope error divided by the theoretical log log slope. |
| **DR-45 Mean Absolute Residual** | A measurement model's mean absolute residual is the average abs residual across the observed scales related to the measurement model. |
| **DR-46 Outlier Count** | A measurement model's outlier count is the number of the measurement model's observed scales that are outliers. |
| **DR-47 Total Point Count** | A measurement model's total point count is the number of observed scales related to the measurement model. |
| **DR-48 Outlier Rate** | The measurement model's outlier rate is determined by the following priority:<br>1. 0, if the total point count is 0;<br>2. in all other cases, the outlier count divided by the total point count. |
| **DR-49 Effective Point Count** | A measurement model's effective point count is computed as the total point count minus the outlier count. |
| **DR-50 Residual RMS From Inference** | A measurement model's residual RMS from inference — taken from the linked system. |
| **DR-51 Cutoff Log Min Scale** | A measurement model's cutoff log min scale is computed as the LOG10 of the cutoff min scale. |
| **DR-52 Cutoff Log Max Scale** | A measurement model's cutoff log max scale is computed as the LOG10 of the cutoff max scale. |
| **DR-53 Cutoff Range Span** | A measurement model's cutoff range span is computed as the cutoff log max scale minus the cutoff log min scale. |
| **DR-54 Base Scale** | An observed scale's base scale — taken from the linked system. |
| **DR-55 Scale Factor** | An observed scale's scale factor — taken from the linked system. |
| **DR-56 Scale Factor Power** | An observed scale's scale factor power is computed as the scale factor raised to the power of the iteration. |
| **DR-57 Scale** | An observed scale's scale is computed as the base scale times the scale factor power. |
| **DR-58 Log Scale** | An observed scale's log scale is computed as the LOG10 of the scale. |
| **DR-59 Log Measure** | An observed scale's log measure is computed as the LOG10 of the measure. |
| **DR-60 Fitted Slope** | An observed scale's fitted slope — taken from the linked system. |
| **DR-61 Fitted Intercept** | An observed scale's fitted intercept — taken from the linked system. |
| **DR-62 Residual RMS** | An observed scale's residual RMS — taken from the linked system. |
| **DR-63 Predicted Log Measure** | An observed scale's predicted log measure is computed as the fitted slope times the log scale plus the fitted intercept. |
| **DR-64 Residual** | An observed scale's residual is computed as the log measure minus the predicted log measure. |
| **DR-65 Residual Squared** | An observed scale's residual squared is computed as the residual times the residual. |
| **DR-66 Standardized Residual** | The observed scale's standardized residual is determined by the following priority:<br>1. 0, if the residual RMS is 0;<br>2. in all other cases, the residual divided by the residual RMS. |
| **DR-67 Is Outlier** | An observed scale is considered an outlier if the absolute value of the standardized residual is greater than 2.5. |
| **DR-68 Scale Ratio** | The observed scale's scale ratio is determined by the following priority:<br>1. 0, if the base scale is 0;<br>2. in all other cases, the scale divided by the base scale. |
| **DR-69 Abs Residual** | An observed scale's abs residual is computed as the absolute value of the residual. |
| **DR-70 Slope Confidence Interval** | The inference run's slope confidence interval is determined by the following priority:<br>1. 0, if the point count is 0;<br>2. in all other cases, 1.96 times the residual RMS divided by the square root of the point count. |
| **DR-71 Min Log Scale** | An inference run's min log scale is the smallest log scale across the observed scales related to the inference run. |
| **DR-72 Max Log Scale** | An inference run's max log scale is the largest log scale across the observed scales related to the inference run. |
| **DR-73 Min Log Measure** | An inference run's min log measure is the smallest log measure across the observed scales related to the inference run. |
| **DR-74 Max Log Measure** | An inference run's max log measure is the largest log measure across the observed scales related to the inference run. |
| **DR-75 Log Measure Range** | An inference run's log measure range is computed as the max log measure minus the min log measure. |
| **DR-76 Abs Slope Delta** | An inference run's abs slope delta is computed as the absolute value of the slope delta. |
| **DR-77 Slope is Significant** | An inference run is flagged slope is significant if the abs slope delta is greater than the slope confidence interval. |
| **DR-78 One Plus Residual RMS** | An inference run's one plus residual RMS is computed as 1 plus the residual RMS. |
| **DR-79 Fit Efficiency** | The inference run's fit efficiency is determined by the following priority:<br>1. 0, if the one plus residual RMS is 0;<br>2. in all other cases, the r2 divided by the one plus residual RMS. |
| **DR-80 Normalized RMSE** | The inference run's normalized RMSE is determined by the following priority:<br>1. 0, if the log measure range is 0;<br>2. in all other cases, the residual RMS divided by the log measure range. |
| **DR-81 Slope to Theoretical Ratio** | The inference run's slope to theoretical ratio is determined by the following priority:<br>1. 0, if the theoretical log log slope is 0;<br>2. in all other cases, the fitted slope divided by the theoretical log log slope. |
| **DR-82 One Minus R2** | An inference run's one minus r2 is computed as 1 minus the r2. |
| **DR-83 Point Count Minus One** | An inference run's point count minus one is computed as the point count minus 1. |
| **DR-84 Point Count Minus Two** | An inference run's point count minus two is computed as the point count minus 2. |
| **DR-85 Adjusted R2** | The inference run's adjusted r2 is determined by the following priority:<br>1. 0, if the point count minus two is 0;<br>2. in all other cases, 1 minus the one minus r2 times the point count minus one divided by the point count minus two. |
| **DR-86 Residual RMS Squared** | An inference run's residual RMS squared is computed as the residual RMS times the residual RMS. |
| **DR-87 Log Residual RMS Squared** | An inference run's log residual RMS squared is computed as the logarithm of the residual RMS squared. |
| **DR-88 Log Point Count** | An inference run's log point count is computed as the logarithm of the point count. |
| **DR-89 BIC** | An inference run's BIC is computed as the point count times the log residual RMS squared plus 2 times the log point count. |
| **DR-90 Regime Span** | A scale regime's regime span is computed as the max log scale minus the min log scale. |
| **DR-91 Regime Center** | A scale regime's regime center is computed as the min log scale plus the max log scale divided by 2. |
| **DR-92 Theoretical Log Log Slope** | A scale regime's theoretical log log slope — taken from the linked system. |
| **DR-93 Slope Deviation From Global** | A scale regime's slope deviation from global is computed as the expected slope minus the theoretical log log slope. |
| **DR-94 Points in Regime** | A scale regime's points in regime is the number of scales related to the scale regime. |

## 5 Traceability to Schema

_The expression column is the rule's definition in RuleSpeak® notation —
the same logic the rulebook stores, written for a business reader._

| Schema element | Kind | Expression |
|----------------|------|------------|
| **systems.EmpiricalFitQuality** | lookup | `Lookup(inference_runs.R2 via SystemID)` |
| **systems.EmpiricalSlopeDeviation** | formula | `Abs(Lookup(inference_runs.SlopeDelta via SystemID))` |
| **systems.MeasurementNoiseLevel** | lookup | `Lookup(measurement_models.NoiseSigma via SystemID)` |
| **systems.DataQualityScore** | formula | `EmpiricalFitQuality * 1 - EmpiricalSlopeDeviation` |
| **systems.RelativeSlopeError** | formula | `Lookup(inference_runs.SlopeDelta via SystemID) / TheoreticalLogLogSlope` |
| **systems.IsHighQualityFit** | formula | `And(EmpiricalFitQuality > 0.99, EmpiricalSlopeDeviation < 0.05)` |
| **systems.ScaleRangeSpan** | lookup | `Lookup(system_stats.DeltaLogScale via SystemID)` |
| **systems.MeasureRangeSpan** | lookup | `Lookup(system_stats.DeltaLogMeasure via SystemID)` |
| **scales.BaseScale** | lookup | `Lookup(systems.BaseScale via System)` |
| **scales.ScaleFactor** | lookup | `Lookup(systems.ScaleFactor via System)` |
| **scales.ScaleFactorPower** | formula | `Power(ScaleFactor, Iteration)` |
| **scales.Scale** | formula | `BaseScale * ScaleFactorPower` |
| **scales.LogScale** | formula | `Log10(Scale)` |
| **scales.LogMeasure** | formula | `Log10(Measure)` |
| **scales.TheoreticalLogLogSlope** | lookup | `Lookup(systems.TheoreticalLogLogSlope via System)` |
| **scales.EmpiricalLogLogSlope** | lookup | `Lookup(system_stats.EmpiricalLogLogSlope via System)` |
| **scales.SystemMinLogScale** | lookup | `Lookup(system_stats.MinLogScale via System)` |
| **scales.SystemMaxLogScale** | lookup | `Lookup(system_stats.MaxLogScale via System)` |
| **scales.SystemDeltaLogScale** | lookup | `Lookup(system_stats.DeltaLogScale via System)` |
| **scales.ScaleRatio** | formula | `If(BaseScale = 0, 0, Scale / BaseScale)` |
| **scales.LogScaleNormalized** | formula | `If(SystemDeltaLogScale = 0, 0, LogScale - SystemMinLogScale / SystemDeltaLogScale)` |
| **system_stats.SystemDisplayName** | lookup | `Lookup(systems.DisplayName via System)` |
| **system_stats.TheoreticalLogLogSlope** | lookup | `Lookup(systems.TheoreticalLogLogSlope via System)` |
| **system_stats.PointCount** | rollup | `Count(scales via System)` |
| **system_stats.MinLogScale** | rollup | `Min(scales.LogScale via System)` |
| **system_stats.MaxLogScale** | rollup | `Max(scales.LogScale via System)` |
| **system_stats.MinLogMeasure** | rollup | `Min(scales.LogMeasure via System)` |
| **system_stats.MaxLogMeasure** | rollup | `Max(scales.LogMeasure via System)` |
| **system_stats.DeltaLogMeasure** | formula | `MinLogMeasure - MaxLogMeasure` |
| **system_stats.DeltaLogScale** | formula | `MaxLogScale - MinLogScale` |
| **system_stats.EmpiricalLogLogSlope** | formula | `If(DeltaLogScale = 0, 0, DeltaLogMeasure / DeltaLogScale)` |
| **system_stats.SlopeError** | formula | `EmpiricalLogLogSlope - TheoreticalLogLogSlope` |
| **system_stats.FittedSlope** | lookup | `Lookup(inference_runs.FittedSlope via System)` |
| **system_stats.FittedVsEmpiricalDelta** | formula | `FittedSlope - EmpiricalLogLogSlope` |
| **system_stats.R2** | lookup | `Lookup(inference_runs.R2 via System)` |
| **system_stats.QualityWeightedSlope** | formula | `R2 * FittedSlope` |
| **system_stats.ResidualRMS** | lookup | `Lookup(inference_runs.ResidualRMS via System)` |
| **system_stats.NoiseSigma** | lookup | `Lookup(measurement_models.NoiseSigma via System)` |
| **system_stats.SlopeToNoiseRatio** | formula | `If(NoiseSigma = 0, 0, Abs(EmpiricalLogLogSlope) / NoiseSigma)` |
| **system_stats.DeviationScore** | lookup | `Lookup(inference_runs.DeviationScore via System)` |
| **system_stats.AbsDeltaLogMeasure** | formula | `Abs(DeltaLogMeasure)` |
| **system_stats.LogLogArea** | formula | `DeltaLogScale * AbsDeltaLogMeasure` |
| **system_stats.DataDensity** | formula | `If(LogLogArea = 0, 0, PointCount / LogLogArea)` |
| **system_stats.RelativeSlopeError** | formula | `If(TheoreticalLogLogSlope = 0, 0, SlopeError / TheoreticalLogLogSlope)` |
| **measurement_models.MeanAbsoluteResidual** | rollup | `Average(observed_scales.AbsResidual via MeasurementModel)` |
| **measurement_models.OutlierCount** | rollup | `Count(observed_scales via MeasurementModel)` |
| **measurement_models.TotalPointCount** | rollup | `Count(observed_scales via MeasurementModel)` |
| **measurement_models.OutlierRate** | formula | `If(TotalPointCount = 0, 0, OutlierCount / TotalPointCount)` |
| **measurement_models.EffectivePointCount** | formula | `TotalPointCount - OutlierCount` |
| **measurement_models.ResidualRMSFromInference** | lookup | `Lookup(inference_runs.ResidualRMS via System)` |
| **measurement_models.CutoffLogMinScale** | formula | `Log10(CutoffMinScale)` |
| **measurement_models.CutoffLogMaxScale** | formula | `Log10(CutoffMaxScale)` |
| **measurement_models.CutoffRangeSpan** | formula | `CutoffLogMaxScale - CutoffLogMinScale` |
| **observed_scales.BaseScale** | lookup | `Lookup(systems.BaseScale via System)` |
| **observed_scales.ScaleFactor** | lookup | `Lookup(systems.ScaleFactor via System)` |
| **observed_scales.ScaleFactorPower** | formula | `Power(ScaleFactor, Iteration)` |
| **observed_scales.Scale** | formula | `BaseScale * ScaleFactorPower` |
| **observed_scales.LogScale** | formula | `Log10(Scale)` |
| **observed_scales.LogMeasure** | formula | `Log10(Measure)` |
| **observed_scales.FittedSlope** | lookup | `Lookup(inference_runs.FittedSlope via System)` |
| **observed_scales.FittedIntercept** | lookup | `Lookup(inference_runs.FittedIntercept via System)` |
| **observed_scales.ResidualRMS** | lookup | `Lookup(inference_runs.ResidualRMS via System)` |
| **observed_scales.PredictedLogMeasure** | formula | `FittedSlope * LogScale + FittedIntercept` |
| **observed_scales.Residual** | formula | `LogMeasure - PredictedLogMeasure` |
| **observed_scales.ResidualSquared** | formula | `Residual * Residual` |
| **observed_scales.StandardizedResidual** | formula | `If(ResidualRMS = 0, 0, Residual / ResidualRMS)` |
| **observed_scales.IsOutlier** | formula | `Abs(StandardizedResidual) > 2.5` |
| **observed_scales.ScaleRatio** | formula | `If(BaseScale = 0, 0, Scale / BaseScale)` |
| **observed_scales.AbsResidual** | formula | `Abs(Residual)` |
| **inference_runs.SlopeConfidenceInterval** | formula | `If(PointCount = 0, 0, 1.96 * ResidualRMS / Sqrt(PointCount))` |
| **inference_runs.MinLogScale** | rollup | `Min(observed_scales.LogScale via System)` |
| **inference_runs.MaxLogScale** | rollup | `Max(observed_scales.LogScale via System)` |
| **inference_runs.MinLogMeasure** | rollup | `Min(observed_scales.LogMeasure via System)` |
| **inference_runs.MaxLogMeasure** | rollup | `Max(observed_scales.LogMeasure via System)` |
| **inference_runs.LogMeasureRange** | formula | `MaxLogMeasure - MinLogMeasure` |
| **inference_runs.AbsSlopeDelta** | formula | `Abs(SlopeDelta)` |
| **inference_runs.SlopeIsSignificant** | formula | `AbsSlopeDelta > SlopeConfidenceInterval` |
| **inference_runs.OnePlusResidualRMS** | formula | `1 + ResidualRMS` |
| **inference_runs.FitEfficiency** | formula | `If(OnePlusResidualRMS = 0, 0, R2 / OnePlusResidualRMS)` |
| **inference_runs.NormalizedRMSE** | formula | `If(LogMeasureRange = 0, 0, ResidualRMS / LogMeasureRange)` |
| **inference_runs.SlopeToTheoreticalRatio** | formula | `If(TheoreticalLogLogSlope = 0, 0, FittedSlope / TheoreticalLogLogSlope)` |
| **inference_runs.OneMinusR2** | formula | `1 - R2` |
| **inference_runs.PointCountMinusOne** | formula | `PointCount - 1` |
| **inference_runs.PointCountMinusTwo** | formula | `PointCount - 2` |
| **inference_runs.AdjustedR2** | formula | `If(PointCountMinusTwo = 0, 0, 1 - OneMinusR2 * PointCountMinusOne / PointCountMinusTwo)` |
| **inference_runs.ResidualRMSSquared** | formula | `ResidualRMS * ResidualRMS` |
| **inference_runs.LogResidualRMSSquared** | formula | `Log(ResidualRMSSquared)` |
| **inference_runs.LogPointCount** | formula | `Log(PointCount)` |
| **inference_runs.BIC** | formula | `PointCount * LogResidualRMSSquared + 2 * LogPointCount` |
| **scale_regimes.RegimeSpan** | formula | `MaxLogScale - MinLogScale` |
| **scale_regimes.RegimeCenter** | formula | `MinLogScale + MaxLogScale / 2` |
| **scale_regimes.TheoreticalLogLogSlope** | lookup | `Lookup(systems.TheoreticalLogLogSlope via System)` |
| **scale_regimes.SlopeDeviationFromGlobal** | formula | `ExpectedSlope - TheoreticalLogLogSlope` |
| **scale_regimes.PointsInRegime** | rollup | `Count(scales via System)` |

---

_This document is rendered in **RuleSpeak®**, the declarative business-rule
notation created by **Ronald G. Ross**, and follows the conventions of
**SBVR** (Semantics of Business Vocabulary and Business Rules). With thanks to
Ronald G. Ross for RuleSpeak® and his foundational work on business rules —
[www.RonRoss.info](https://www.RonRoss.info)._
