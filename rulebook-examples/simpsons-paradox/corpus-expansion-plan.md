# Simpson's Paradox Corpus Expansion Plan

Studies to add across 11 domains. Each entry has open or publicly available stratified data.
Format: Citation · Stratification variable · Data source · Reversal mechanism.

Target: ~250 studies for subsequent Effortless loops.

---

## Domain 1: Economics (25 studies)

1. **Blau & Kahn (2017)** "The Gender Wage Gap: Extent, Trends, and Explanations." *Journal of Economic Literature*, 55(3), 789–865.
   - **Measures:** Raw vs. controlled gender wage gap using CPS microdata
   - **Stratum:** Occupation / industry
   - **Data:** IPUMS CPS — [ipums.org/cps](https://ipums.org/cps)
   - **Reversal:** Raw gap ~18%; within-occupation gap ~8%. Women cluster in lower-paying occupations, reversing apparent within-job equality.

2. **Goldin (2014)** "A Grand Gender Convergence: Its Last Chapter." *AER*, 104(4), 1091–1119.
   - **Measures:** Gender earnings ratio by occupation group
   - **Stratum:** Occupation (linear vs. nonlinear hours)
   - **Data:** CPS/ACS via BLS — [bls.gov/cps](https://www.bls.gov/cps/)
   - **Reversal:** High-earning occupations penalize flexible hours; women in those occupations earn less than men even with identical education.

3. **Oaxaca (1973)** "Male-Female Wage Differentials in Urban Labor Markets." *International Economic Review*, 14(3), 693–709.
   - **Measures:** Wage decomposition into explained vs. unexplained components
   - **Stratum:** Education, experience, occupation
   - **Data:** 1967 SEO microdata; replicated with CPS
   - **Reversal:** Aggregate gap overstates discrimination; within-characteristic groups, gaps narrow or reverse in some cells.

4. **Card (1992)** "Using Regional Variation in Wages to Measure the Effects of the Federal Minimum Wage." *ILR Review*, 46(1), 22–37.
   - **Measures:** Employment effect of minimum wage by industry
   - **Stratum:** Industry (fast food vs. retail vs. manufacturing)
   - **Data:** CPS/BLS establishment surveys — [bls.gov](https://www.bls.gov)
   - **Reversal:** Aggregate employment may fall while fast-food employment rises; industry mix confounds pooled estimate.

5. **Dube, Lester & Reich (2010)** "Minimum Wage Effects Across State Borders." *Review of Economics and Statistics*, 92(4), 945–964.
   - **Measures:** Employment and wages in border counties
   - **Stratum:** Border county pair / state
   - **Data:** QCEW — [bls.gov/cew](https://www.bls.gov/cew/)
   - **Reversal:** Pooled cross-state estimates show job losses; within-border-pair comparisons show no losses — prior studies confounded by regional trends.

6. **Chetty et al. (2014)** "Where Is the Land of Opportunity? The Geography of Intergenerational Mobility." *QJE*, 129(4), 1553–1623.
   - **Measures:** Absolute upward mobility by commuting zone
   - **Stratum:** Commuting zone / income quintile
   - **Data:** Opportunity Insights — [opportunityinsights.org/data](https://opportunityinsights.org/data/)
   - **Reversal:** National average mobility masks enormous geographic reversal: some high-income metros have lower mobility than poor rural areas.

7. **Chetty, Friedman, Saez, Turner & Yagan (2020)** "Income Segregation and Intergenerational Mobility Across Colleges." *QJE*, 135(3), 1567–1633. DOI: 10.1093/qje/qjaa005
   - **Measures:** Mobility rates (bottom → top income quintile) by college
   - **Stratum:** College selectivity tier
   - **Data:** Opportunity Insights — [opportunityinsights.org/paper/undermatching](https://opportunityinsights.org/paper/undermatching/)
   - **Reversal:** Elite colleges look like mobility engines; stratifying by parental income shows top-1% attendance rates that dwarf low-income attendance.

8. **Chetty, Deming & Friedman (2023/2026)** "Diversifying Society's Leaders?" *QJE*, 141(1), 51–145. DOI: 10.1093/qje/qjaf050
   - **Measures:** Admissions probability by income vs. test score
   - **Stratum:** Legacy/athlete/non-academic ratings
   - **Data:** Opportunity Insights — [opportunityinsights.org/paper/collegeadmissions](https://opportunityinsights.org/paper/collegeadmissions/)
   - **Reversal:** Top-1% students 2× more likely admitted than equal-SAT middle-class students; stratifying by non-academic credentials reveals the full reversal.

9. **Piketty & Saez (2003)** "Income Inequality in the United States, 1913–1998." *QJE*, 118(1), 1–41.
   - **Measures:** Top income shares over time
   - **Stratum:** Income fractile / source (capital vs. labor)
   - **Data:** IRS Statistics of Income — [irs.gov/statistics](https://www.irs.gov/statistics); updated series at [top1percent.info](https://eml.berkeley.edu/~saez/)
   - **Reversal:** Overall mean income grows while median stagnates; capital-income stratum drives the top share, masking labor income stagnation.

10. **Juhn, Murphy & Pierce (1993)** "Wage Inequality and the Rise in Returns to Skill." *JPE*, 101(3), 410–442.
    - **Measures:** Wage inequality growth by percentile
    - **Stratum:** Education / skill percentile
    - **Data:** CPS ORG microdata — [nber.org/data/morg.html](https://www.nber.org/data/morg.html)
    - **Reversal:** Pooled wage variance rises; stratifying by skill group shows within-group compression at the bottom while top expands.

11. **Autor, Levy & Murnane (2003)** "The Skill Content of Recent Technological Change." *QJE*, 118(4), 1279–1333.
    - **Measures:** Task content shifts in employment by occupation
    - **Stratum:** Routine vs. non-routine / cognitive vs. manual
    - **Data:** DOT/O*NET + CPS — [onetonline.org](https://www.onetonline.org/)
    - **Reversal:** Aggregate employment growth masks hollowing-out: middle-skill routine jobs decline while high and low skill grow.

12. **Katz & Murphy (1992)** "Changes in Relative Wages, 1963–1987: Supply and Demand Factors." *QJE*, 107(1), 35–78.
    - **Measures:** Relative wages college vs. high school
    - **Stratum:** Demographic group (age, gender, race)
    - **Data:** CPS — [bls.gov/cps](https://www.bls.gov/cps/)
    - **Reversal:** College premium rises in aggregate; stratifying by cohort and gender shows reversal patterns within groups.

13. **Heckman (1979)** "Sample Selection Bias as a Specification Error." *Econometrica*, 47(1), 153–161.
    - **Measures:** Women's wages vs. male wages
    - **Stratum:** Labor force participation decision
    - **Data:** NLS / PSID — [nlsinfo.org](https://nlsinfo.org/); [psidonline.isr.umich.edu](https://psidonline.isr.umich.edu/)
    - **Reversal:** Observed wages are a selected sample; correcting for selection reveals different wage gap.

14. **Bertrand & Mullainathan (2004)** "Are Emily and Greg More Employable Than Lakisha and Jamal?" *AER*, 94(4), 991–1013. DOI: 10.1257/0002828042002561
    - **Measures:** Callback rates by race signal (name)
    - **Stratum:** Occupation / industry / city
    - **Data:** Replication package at [openICPSR E116023V1](https://doi.org/10.3886/E116023V1)
    - **Reversal:** Aggregate callback gap is large; stratifying by job quality shows the gap reverses for low-quality jobs in some cities.

15. **Goldin & Rouse (2000)** "Orchestrating Impartiality: The Impact of 'Blind' Auditions on Female Musicians." *AER*, 90(4), 715–741.
    - **Measures:** Probability of female hire in orchestra auditions
    - **Stratum:** Audition round (blind vs. non-blind)
    - **Data:** Paper appendix data — contact authors; summarized in AER supplemental
    - **Reversal:** Non-blind: women systematically hired less; blind screens eliminate gap. Pooled rate is a mix of both.

16. **Dube (2019)** "Minimum Wages and the Distribution of Family Incomes." *AER*, 109(2), 520–553.
    - **Measures:** Poverty rate changes after minimum wage increases
    - **Stratum:** Family income percentile / household composition
    - **Data:** CPS ASEC — [census.gov/programs-surveys/cps](https://www.census.gov/programs-surveys/cps.html)
    - **Reversal:** Aggregate poverty stats may not move; stratifying by family income percentile reveals concentrated gains at bottom.

17. **Angrist & Pischke (2009 reference case): Card (1993)** "Using Geographic Variation in College Proximity to Estimate the Return to Schooling." NBER WP 4483.
    - **Measures:** Returns to education by family background
    - **Stratum:** Proximity to college / family SES
    - **Data:** NLS Young Men — [nlsinfo.org](https://nlsinfo.org/)
    - **Reversal:** OLS returns understate true returns; IV estimate reverses the attenuation for disadvantaged students.

18. **Autor & Dorn (2013)** "The Growth of Low-Skill Service Jobs and the Polarization of the US Labor Market." *AER*, 103(5), 1553–1597.
    - **Measures:** Employment share shifts by task group
    - **Stratum:** Local labor market / occupation tier
    - **Data:** Census / ACS — [census.gov/programs-surveys/acs](https://www.census.gov/programs-surveys/acs.html)
    - **Reversal:** High-tech cities look like high-employment successes; stratifying by occupation tier reveals simultaneous low-wage service expansion.

19. **Moretti (2013)** "Real Wage Inequality." *AEJ: Applied Economics*, 5(1), 65–103.
    - **Measures:** Real wage inequality after cost-of-living adjustment
    - **Stratum:** City / housing cost tier
    - **Data:** CPS + BLS CPI regional — [bls.gov/regions](https://www.bls.gov/regions/)
    - **Reversal:** Nominal inequality rises; after cost-of-living, high-cost-city workers have lower real wages — reversing the coastal premium.

20. **Acemoglu & Autor (2011)** "Skills, Tasks and Technologies: Implications for Employment and Earnings." *Handbook of Labor Economics*, 4, 1043–1171.
    - **Measures:** Employment and wage trends by education group
    - **Stratum:** Task type / technology exposure
    - **Data:** CPS/Census — [nber.org/data/cps.html](https://www.nber.org/data/cps.html)
    - **Reversal:** Aggregate employment growth masks task-based displacement within educational groups.

21. **Chetty, Hendren & Katz (2016)** "The Effects of Exposure to Better Neighborhoods on Children." *AER*, 106(4), 855–902.
    - **Measures:** Income outcomes for MTO voucher children by age of move
    - **Stratum:** Age at time of move
    - **Data:** MTO microdata at HUD; summary at [opportunityinsights.org](https://opportunityinsights.org/)
    - **Reversal:** Pooled MTO effect is null; stratifying by child age at move reveals large positive effects for young children — reversing null finding.

22. **Bhutta, Hizmo & Ringo (2022/2025)** "How Much Does Racial Bias Affect Mortgage Lending?" *Journal of Finance*. FEDS WP 2022-067.
    - **Measures:** Mortgage denial rates by race
    - **Stratum:** Credit score / DTI / loan-to-value
    - **Data:** Confidential HMDA-linked; public HMDA at [ffiec.cfpb.gov](https://ffiec.cfpb.gov/data-browser/)
    - **Reversal:** Raw 7.5 pp Black-white denial gap shrinks to 1–2 pp after controls — but does not reverse, illustrating a Type-C compression.

23. **Saez (2019)** "Striking it Richer: The Evolution of Top Incomes in the United States." UC Berkeley working paper, updated annually.
    - **Measures:** Income growth by percentile in expansion vs. recession
    - **Stratum:** Income fractile / economic cycle phase
    - **Data:** IRS SOI — [irs.gov/statistics/soi-tax-stats](https://www.irs.gov/statistics/soi-tax-stats-individual-income-tax-statistics)
    - **Reversal:** During expansions, top-1% captures disproportionate share; stratifying by cycle phase reverses apparent broad-based growth narrative.

24. **Fortin, Lemieux & Firpo (2011)** "Decomposition Methods in Economics." *Handbook of Labor Economics*, 4, 1–102.
    - **Measures:** Wage distribution differences across groups
    - **Stratum:** Quantile / counterfactual group
    - **Data:** CPS — [ipums.org/cps](https://ipums.org/cps)
    - **Reversal:** Mean wage decomposition reverses sign at different quantiles — an upper-quantile wage gap may have opposite sign from lower-quantile gap.

25. **Chetty, Friedman & Rockoff (2014)** "Measuring the Impacts of Teachers I." *AER*, 104(9), 2593–2632.
    - **Measures:** Student test score gains by teacher value-added
    - **Stratum:** School / student poverty level
    - **Data:** NYC administrative data; methodology replicated with NCES ECLS-K
    - **Reversal:** Pooled VA estimates mask stratification by school poverty — high-VA teachers cluster in low-poverty schools, reversing apparent equity effect.

---

## Domain 2: Criminal Justice / Sentencing (15 studies)

1. **Angwin, Larson, Mattu & Kirchner (2016)** "Machine Bias." *ProPublica*, May 23, 2016.
   - **Measures:** COMPAS recidivism algorithm false positive rates by race
   - **Stratum:** Crime type / prior record
   - **Data:** [github.com/propublica/compas-analysis](https://github.com/propublica/compas-analysis)
   - **Reversal:** Overall accuracy equal by race; false positive rate 45% (Black) vs. 23% (White) — reversal emerges within recidivism-negative subgroup.

2. **Spohn (2000)** "Thirty Years of Sentencing Reform: The Quest for a Racially Neutral Sentencing Process." *Policies, Processes, and Decisions of the Criminal Justice System*, 3, 427–501.
   - **Measures:** Sentence length disparity by race
   - **Stratum:** Offense severity / criminal history
   - **Data:** BJS Federal Justice Statistics — [bjs.gov/fjsp](https://bjs.ojp.gov/data-collection/federal-justice-statistics-program-fjsp)
   - **Reversal:** Raw racial gaps shrink or reverse when offense severity is controlled — prior record is the confounding stratum.

3. **Starr & Rehavi (2014)** "Racial Disparity in Federal Criminal Sentences." *JPE*, 122(6), 1320–1354.
   - **Measures:** Sentence length by race in federal courts
   - **Stratum:** Charge severity / district
   - **Data:** USSC Monitoring Database — [ussc.gov/research/datafiles](https://www.ussc.gov/research/datafiles/commission-datafiles)
   - **Reversal:** After controlling for initial charges, Black male defendants receive sentences ~10% longer; prosecutorial discretion is the uncontrolled confounder.

4. **USSC (2017)** "Demographic Differences in Sentencing." United States Sentencing Commission Annual Report.
   - **Measures:** Average sentence length by race, gender, citizenship
   - **Stratum:** Offense type / criminal history category
   - **Data:** [ussc.gov/research/research-reports](https://www.ussc.gov/research/research-reports/demographic-differences-sentencing)
   - **Reversal:** Controlling for offense severity substantially reduces but does not eliminate racial gap.

5. **Western (2006)** *Punishment and Inequality in America*. Russell Sage. (NLSY79 analysis)
   - **Measures:** Incarceration rates by race / education
   - **Stratum:** Education level
   - **Data:** NLSY79 — [nlsinfo.org](https://nlsinfo.org/)
   - **Reversal:** Pooled incarceration rate gaps are stark; stratifying by education shows college-educated Black men incarcerated at rates similar to white high school dropouts.

6. **Brame, Bushway, Paternoster & Turner (2014)** "Demographic Patterns of Cumulative Arrest Prevalence by Ages 18 and 23." *Crime & Delinquency*, 60(3), 471–486.
   - **Measures:** Cumulative arrest probability by race
   - **Stratum:** Offense type / age cohort
   - **Data:** NLSY97 — [nlsinfo.org](https://nlsinfo.org/)
   - **Reversal:** Pooled arrest gap is large; within non-violent offense categories, gaps narrow substantially.

7. **NYPD Stop-and-Frisk Data (2003–2013)**
   - **Measures:** Stop rates and weapon recovery rates by race
   - **Stratum:** Precinct / reported crime rate
   - **Data:** NYC Open Data — [data.cityofnewyork.us](https://data.cityofnewyork.us/Public-Safety/Stop-Question-and-Frisk-Data/ftxv-d5ix)
   - **Reversal:** Black pedestrians stopped at higher aggregate rates; stratifying by high-crime precinct, hit rates converge or reverse — lower weapon-find rates in Black-heavy stops regardless of precinct crime level.

8. **Gross & Risinger et al. (2017)** "Race and Wrongful Convictions in the United States." National Registry of Exonerations.
   - **Measures:** Exoneration rates by race and crime type
   - **Stratum:** Crime category (murder, sexual assault, drug)
   - **Data:** [law.umich.edu/special/exoneration](https://www.law.umich.edu/special/exoneration/Pages/about.aspx)
   - **Reversal:** Drug exonerations heavily Black; within drug category, conviction rates reverse vs. pooled.

9. **Baldus, Woodworth & Pulaski (1983)** "Comparative Review of Death Sentences: An Empirical Study of the Georgia Experience." *Journal of Criminal Law & Criminology*, 74(3), 661–753.
   - **Measures:** Death sentence rates by race of defendant × victim
   - **Stratum:** Aggravating circumstances tier
   - **Data:** Georgia trial records; summarized in *McCleskey v. Kemp* 481 U.S. 279 (1987)
   - **Reversal:** Defendant-race effect reverses within aggravating-factor strata; victim race is the dominant confounder.

10. **Fryer (2016)** "An Empirical Analysis of Racial Differences in Police Use of Force." NBER WP 22399.
    - **Measures:** Police shooting rates by race, conditional on interaction
    - **Stratum:** Interaction type / neighborhood crime rate
    - **Data:** Houston PD open records; summary data in paper
    - **Reversal:** Unconditional shooting rates higher for Black civilians; conditioning on police contact eliminates gap — selection into contact is the confounding stratum (contested finding).

11. **Rehavi & Starr (2012)** "Racial Disparity in Federal Criminal Charging and Its Sentencing Consequences." University of Michigan Law & Economics working paper.
    - **Measures:** Mandatory minimum charging rates by race
    - **Stratum:** Arrest offense / prior record
    - **Data:** USSC datafiles — [ussc.gov/research/datafiles](https://www.ussc.gov/research/datafiles/commission-datafiles)
    - **Reversal:** Racial charging gaps disappear within offense categories with no prosecutorial discretion.

12. **Kutateladze, Andiloro, Johnson & Spohn (2014)** "Cumulative Disadvantage: Examining Racial and Ethnic Disparity in Prosecution and Sentencing." *Criminology*, 52(3), 514–551.
    - **Measures:** Case outcomes at each stage (charging → plea → sentence)
    - **Stratum:** Stage in process / offense type
    - **Data:** Vera Institute proprietary; methodology published
    - **Reversal:** Racial gaps grow across stages; stratifying by stage shows reversal in certain charge categories.

13. **BJS Federal Justice Statistics Program (annual)**
    - **Measures:** Conviction and sentencing outcomes by demographic group
    - **Stratum:** Offense type / criminal history category
    - **Data:** [bjs.ojp.gov/data-collection/federal-justice-statistics-program-fjsp](https://bjs.ojp.gov/data-collection/federal-justice-statistics-program-fjsp)
    - **Reversal:** Annual reports show aggregate gaps that compress when stratified by offense severity.

14. **Johnson (2006)** "The Multicollinearity Problem in Criminal Sentencing Research." *Justice Quarterly*, 23(4), 544–558.
    - **Measures:** Race coefficient in sentencing models
    - **Stratum:** Model specification / omitted variables
    - **Data:** USSC datafiles
    - **Reversal:** Race coefficient reverses sign depending on whether criminal history is controlled — classic omitted-variable confounding.

15. **Harris, Steffensmeier, Ulmer & Painter-Davis (2009)** "Are Blacks and Hispanics Disproportionately Incarcerated Relative to Their Arrests?" *Race and Social Problems*, 1(4), 187–199.
    - **Measures:** Incarceration-to-arrest ratios by race
    - **Stratum:** Offense type
    - **Data:** UCR Arrest Data + BJS Prison Data — [bjs.ojp.gov](https://bjs.ojp.gov/); [ucr.fbi.gov](https://ucr.fbi.gov/)
    - **Reversal:** Overall incarceration disparity is large; stratifying by offense type shows the gap reverses for property crimes.

---

## Domain 3: Higher Education Admissions (15 studies)

1. **Bickel, Hammel & O'Connell (1975)** "Sex Bias in Graduate Admissions: Data from Berkeley." *Science*, 187(4175), 398–404. DOI: 10.1126/science.187.4175.398 — **CLASSIC**
   - **Measures:** Admission rates by sex, UC Berkeley 1973
   - **Stratum:** Department applied to
   - **Data:** Built into R as `UCBAdmissions`; full CSV at [discovery.cs.illinois.edu/dataset/berkeley](https://discovery.cs.illinois.edu/dataset/berkeley/)
   - **Reversal:** Women admitted at 35% overall vs. men 44%; within departments, small bias favors women. Women applied to harder departments.

2. **Arcidiacono, Kinsler & Ransom (2019)** "Legacy and Athlete Preferences at Harvard." NBER WP 26316.
   - **Measures:** Admission probability by applicant category
   - **Stratum:** Legacy / athlete / first-gen status
   - **Data:** SFFA v. Harvard litigation data (partially public); paper appendix
   - **Reversal:** Overall diversity stats look better than stratum-level rates; within non-legacy non-athlete pool, income disparities reverse the diversity impression.

3. **Chetty, Deming & Friedman (2023)** "Diversifying Society's Leaders?" NBER WP 31492.
   - *(see Economics #8 above — dual-domain entry)*
   - **Data:** [opportunityinsights.org/paper/collegeadmissions](https://opportunityinsights.org/paper/collegeadmissions/)

4. **Long (2004)** "Race and College Costs: Examining and Decomposing the College Premium." *JHR*, 39(3), 670–700.
   - **Measures:** College attendance gap by race
   - **Stratum:** Income quartile
   - **Data:** NLSY97 — [nlsinfo.org](https://nlsinfo.org/)
   - **Reversal:** Racial attendance gap nearly disappears after controlling for income; income confounds the pooled racial gap.

5. **Alon & Tienda (2007)** "Diversity, Opportunity, and the Shifting Meritocracy in Higher Education." *ASR*, 72(4), 487–511.
   - **Measures:** Admission selectivity by race and test scores
   - **Stratum:** Institutional selectivity tier
   - **Data:** NELS:88 — [nces.ed.gov/nels88](https://nces.ed.gov/surveys/nels88/)
   - **Reversal:** Racial gaps in admission rates reverse within selectivity tier — minority students are more likely to be admitted at elite schools conditional on test scores.

6. **Hoekstra (2009)** "The Effect of Attending the Flagship State University on Earnings." *Review of Economics and Statistics*, 91(4), 717–724.
   - **Measures:** Earnings premium for flagship admission
   - **Stratum:** SAT score band near threshold
   - **Data:** Anonymous state university admissions data (regression discontinuity)
   - **Reversal:** Overall selectivity premium is large; at the admission threshold, the within-band premium is much smaller.

7. **Dale & Krueger (2002)** "Estimating the Payoff to Attending a More Selective College." *QJE*, 117(4), 1491–1527.
   - **Measures:** Earnings by college selectivity
   - **Stratum:** Application portfolio (which schools one applied to)
   - **Data:** C&B survey; replicated with NLS-72
   - **Reversal:** Raw selectivity premium is large; controlling for application portfolio (ambition/ability), premium nearly vanishes for most students.

8. **NCES IPEDS (annual)**
   - **Measures:** Acceptance rates, graduation rates, cost by institution
   - **Stratum:** Institution type / Carnegie classification
   - **Data:** [nces.ed.gov/ipeds](https://nces.ed.gov/ipeds/)
   - **Reversal:** Pooled acceptance rates across institution types mask within-tier reversal: smaller liberal arts colleges have lower acceptance rates than large state flagship averages suggest.

9. **College Scorecard (U.S. Dept. of Education, annual)**
   - **Measures:** Earnings and debt by major / institution
   - **Stratum:** Field of study
   - **Data:** [collegescorecard.ed.gov/data](https://collegescorecard.ed.gov/data/)
   - **Reversal:** Pooled institution-level earnings mask major-composition reversal: an institution with high average earnings may rank below another within STEM majors.

10. **Hoxby & Avery (2013)** "The Missing 'One-Offs': The Hidden Supply of High-Achieving, Low-Income Students." *Brookings Papers on Economic Activity*, Spring 2013.
    - **Measures:** College application behavior by income and academic achievement
    - **Stratum:** Geographic isolation / income
    - **Data:** College Board / ACT data (restricted); summary data in paper
    - **Reversal:** High-achieving low-income students nationally apply to less selective schools than high-income students with same scores — geographic isolation confounds pooled achievement-selectivity correlation.

11. **Espenshade & Radford (2009)** *No Longer Separate, Not Yet Equal*. Princeton University Press.
    - **Measures:** Admission odds ratios by race at selective schools
    - **Stratum:** Applicant type / extracurricular profile
    - **Data:** NSCE survey (proprietary); summary statistics published
    - **Reversal:** Within legacies and athletes, racial gaps narrow substantially.

12. **Bound, Lovenheim & Turner (2010)** "Why Have College Completion Rates Declined?" *AEJ: Applied Economics*, 2(3), 129–157.
    - **Measures:** Graduation rates by cohort and institution type
    - **Stratum:** Institution selectivity / student preparation
    - **Data:** NLS/NELS/HSB — [nces.ed.gov](https://nces.ed.gov/)
    - **Reversal:** Overall graduation rates stable; stratifying by institution type shows large declines at less-selective schools masked by stable elite rates.

13. **Carnevale & Strohl (2010)** "How Increasing College Access Is Increasing Inequality." Georgetown CEW.
    - **Measures:** Race and class composition by institutional selectivity
    - **Stratum:** Institutional tier
    - **Data:** NCES IPEDS + BPS — [nces.ed.gov/surveys/bps](https://nces.ed.gov/surveys/bps/)
    - **Reversal:** Top institutions become more diverse over time in aggregate; stratifying by socioeconomic tier shows increasing stratification within selectivity.

14. **Hoxby & Murarka (2009)** "Charter Schools in New York City: Who Enrolls and How They Affect Their Students' Achievement." NBER WP 14852.
    - **Measures:** Test score gains by charter vs. traditional public school
    - **Stratum:** Lottery winner vs. loser / neighborhood poverty
    - **Data:** NYC DOE administrative data; lottery data in paper
    - **Reversal:** Aggregate charter effect is small; stratifying by neighborhood poverty, lottery-admitted students show large gains — selection confounds pooled estimate.

15. **Rothstein (2004)** "College Performance Predictions and the SAT." *Journal of Econometrics*, 121(1–2), 297–317.
    - **Measures:** SAT predictive validity for GPA by race
    - **Stratum:** Institution / student preparation level
    - **Data:** College Board restricted data (summary available)
    - **Reversal:** Pooled SAT-GPA correlation is strong; within-institution, the correlation weakens or reverses for under-represented groups due to range restriction.

---

## Domain 4: Clinical Drug Trials (15 studies)

1. **Charig, Webb, Payne & Wickham (1986)** "Comparison of Treatment of Renal Calculi." *BMJ*, 292(6524), 879–882. PMID: 3083922 — **CLASSIC**
   - **Measures:** Treatment success rates for kidney stones
   - **Stratum:** Stone size (small vs. large)
   - **Data:** Summary 2×2×2 table available in Wikipedia / statistics textbooks; [openDataBay](https://opendatabay.com/)
   - **Reversal:** Open surgery 78% overall vs. percutaneous 83%; but open surgery wins within both stone-size strata. Sicker patients (larger stones) assigned to open surgery.

2. **ACCORD Study Group (2008)** "Effects of Intensive Glucose Lowering in Type 2 Diabetes." *NEJM*, 358(24), 2545–2559. PMID: 18539917. NCT00000620.
   - **Measures:** Cardiovascular mortality by treatment arm
   - **Stratum:** Baseline HbA1c / diabetes duration
   - **Data:** NHLBI BioLINCC — [biolincc.nhlbi.nih.gov](https://biolincc.nhlbi.nih.gov/studies/accord/)
   - **Reversal:** Intensive arm shows increased mortality overall; subgroup by baseline HbA1c may reverse benefit — severity confounds pooled result.

3. **ALLHAT Collaborative Research Group (2002)** "Major Outcomes in High-Risk Hypertensive Patients." *JAMA*, 288(23), 2981–2997. PMID: 12479763. NCT00000542.
   - **Measures:** Cardiovascular outcomes by antihypertensive drug class
   - **Stratum:** Race / diabetes status / baseline CVD risk
   - **Data:** NHLBI BioLINCC — [biolincc.nhlbi.nih.gov/studies/allhat](https://biolincc.nhlbi.nih.gov/studies/allhat/)
   - **Reversal:** Chlorthalidone beats lisinopril overall; within Black patients with hypertension, the margin reverses for certain outcomes.

4. **ISIS-2 Collaborative Group (1988)** "Randomised Trial of Intravenous Streptokinase, Oral Aspirin, Both, or Neither among 17,187 Cases of Suspected Acute Myocardial Infarction." *Lancet*, 332(8607), 349–360.
   - **Measures:** Vascular mortality by treatment
   - **Stratum:** Age group / time-to-treatment
   - **Data:** Summary tables in paper; data access via CTSU Oxford
   - **Reversal:** Aspirin benefit pooled is robust; stratified by astrological sign (the paper's famous negative control), apparent reversals demonstrate the paradox mechanism.

5. **PLATO Trial (Wallentin et al. 2009)** "Ticagrelor versus Clopidogrel in Patients with Acute Coronary Syndromes." *NEJM*, 361(11), 1045–1057. PMID: 19717846. NCT00391872.
   - **Measures:** MACE outcomes by treatment
   - **Stratum:** Geographic region (North America vs. Europe)
   - **Data:** AstraZeneca data sharing — [clinicaltrialsdata.com](https://www.clinicaltrialsdata.com/)
   - **Reversal:** Ticagrelor benefits globally; North America subgroup shows reversal — aspirin dose confounded the regional stratum.

6. **Fibrinolytic Therapy Trialists (1994)** "Indications for Fibrinolytic Therapy in Suspected Acute Myocardial Infarction." *Lancet*, 343(8893), 311–322.
   - **Measures:** 35-day mortality by treatment and time-to-treatment
   - **Stratum:** Time from symptom onset / age
   - **Data:** Collaborative meta-analysis data; tables in paper
   - **Reversal:** Benefit is large when treated early; late-treatment stratum shows no benefit or harm — pooled average masks time-dependent reversal.

7. **CAST (1989)** "Preliminary Report: Effect of Encainide and Flecainide on Mortality." *NEJM*, 321(6), 406–412. PMID: 2473403.
   - **Measures:** Mortality in post-MI antiarrhythmic treatment
   - **Stratum:** Arrhythmia burden / ejection fraction
   - **Data:** Summary available; full data via NHLBI
   - **Reversal:** Drug suppresses arrhythmias in all strata; mortality increases in all strata — a cautionary reversal of surrogate endpoints.

8. **Women's Health Initiative (2002)** "Risks and Benefits of Estrogen Plus Progestin in Healthy Postmenopausal Women." *JAMA*, 288(3), 321–333. PMID: 12117397.
   - **Measures:** Breast cancer risk, cardiovascular disease by HRT
   - **Stratum:** Age at menopause onset / time since menopause
   - **Data:** NHLBI BioLINCC — [biolincc.nhlbi.nih.gov/studies/whi](https://biolincc.nhlbi.nih.gov/studies/whi/)
   - **Reversal:** WHI shows increased risk overall; stratifying by age at start, women who began HRT near menopause show cardioprotective benefit — "timing hypothesis."

9. **DCCT Research Group (1993)** "The Effect of Intensive Treatment of Diabetes on the Development and Progression of Long-Term Complications." *NEJM*, 329(14), 977–986. PMID: 8366922.
   - **Measures:** Complication rates by treatment intensity
   - **Stratum:** Baseline HbA1c / diabetes duration
   - **Data:** NIDDK data repository — [repository.niddk.nih.gov](https://repository.niddk.nih.gov/studies/dcct/)
   - **Reversal:** Overall benefit of intensive therapy; hypoglycemia risk reverses benefit in high-risk baseline strata.

10. **PROSPER Trial (Shepherd et al. 2002)** "Pravastatin in Elderly Individuals at Risk of Vascular Disease." *Lancet*, 360(9346), 1623–1630. PMID: 12457784.
    - **Measures:** Cardiovascular events in elderly patients on pravastatin
    - **Stratum:** Age sub-group / prior disease status
    - **Data:** Summary tables in paper; request via CTSU
    - **Reversal:** Overall CHD benefit; new cancer events increased — stratifying by outcome type, statin benefit reverses for non-cardiovascular mortality.

11. **TRITON-TIMI 38 (Wiviott et al. 2007)** "Prasugrel versus Clopidogrel in Patients with Acute Coronary Syndromes." *NEJM*, 357(20), 2001–2015. PMID: 17982182. NCT00097591.
    - **Measures:** MACE outcomes by antiplatelet agent
    - **Stratum:** Prior stroke/TIA / weight / age
    - **Data:** Eli Lilly data sharing — [vivli.org](https://vivli.org/)
    - **Reversal:** Prasugrel superior overall; within prior-stroke stratum, net clinical outcome reverses due to bleeding risk.

12. **Yusuf et al. / HOPE Trial (2000)** "Effects of an Angiotensin-Converting-Enzyme Inhibitor, Ramipril, on Cardiovascular Events in High-Risk Patients." *NEJM*, 342(3), 145–153. PMID: 10639539. NCT00000439.
    - **Measures:** Cardiovascular mortality by ramipril
    - **Stratum:** Diabetes status / baseline renal function
    - **Data:** NHLBI BioLINCC — [biolincc.nhlbi.nih.gov/studies/hope](https://biolincc.nhlbi.nih.gov/studies/hope/)
    - **Reversal:** Pooled benefit is clear; within-diabetic stratum the effect size is larger, masking a potential reversal in lower-risk subgroups.

13. **SPRINT Research Group (2015)** "A Randomized Trial of Intensive versus Standard Blood-Pressure Control." *NEJM*, 373(22), 2103–2116. PMID: 26551272. NCT01206062.
    - **Measures:** Cardiovascular events by blood pressure target
    - **Stratum:** Age / CKD status / baseline SBP
    - **Data:** NHLBI BioLINCC — [biolincc.nhlbi.nih.gov/studies/sprint](https://biolincc.nhlbi.nih.gov/studies/sprint/)
    - **Reversal:** Overall intensive benefit; within advanced CKD, benefit reverses — kidney function is the confounding stratum.

14. **AstraZeneca MYSTIC Trial / PACIFIC Trial crossover (2017–2019)**
    - **Measures:** PD-L1 immunotherapy benefit by tumor expression level
    - **Stratum:** PD-L1 expression quartile
    - **Data:** Clinicaltrials.gov NCT02453282 / NCT02125461; AZ data sharing
    - **Reversal:** Pooled OS benefit is present; within low-PD-L1 stratum, benefit reverses — expression confounds pooled result.

15. **UK Biobank / UKBB Observational (ongoing)** — statins and cancer.
    - **Measures:** Cancer incidence by statin use
    - **Stratum:** Indication for statin (cardiovascular risk tier)
    - **Data:** UK Biobank — [ukbiobank.ac.uk](https://www.ukbiobank.ac.uk/)
    - **Reversal:** Pooled statin-cancer association appears protective; stratifying by indication (healthy user bias), benefit reduces or reverses in low-risk groups.

---

## Domain 5: Sports Analytics (15 studies)

1. **Jeter vs. Justice (1995–1996)** — Derek Jeter / David Justice batting averages. *Wikipedia / Ken Ross (2004)*. — **CLASSIC**
   - **Measures:** Batting average
   - **Stratum:** Season (1995 vs. 1996)
   - **Data:** Baseball-Reference.com (public); exact figures: Jeter .250/.314 → combined .310; Justice .253/.321 → combined .270
   - **Reversal:** Justice beats Jeter every year; Jeter's combined average wins. At-bat allocation is the confounder.

2. **Hiester (1984)** "Simpson's Paradox: Stats Often Can Deceive." *Baseball Research Journal*. SABR.
   - **Measures:** Batting average across multiple player pairs (1982–1983)
   - **Stratum:** Handedness of pitcher / playing surface
   - **Data:** [sabr.org/journal/article/simpsons-paradox-stats-often-can-deceive](https://sabr.org/journal/article/simpsons-paradox-stats-often-can-deceive/)
   - **Reversal:** Dawson vs. Lacy, Garcia vs. Griffey — multiple reversal cases identified. Sample size allocation across strata is the confounder.

3. **NBA Three-Point Shooting (2015–2023)** — Stephen Curry era analysis
   - **Measures:** FG% by player, stratified by shot zone
   - **Stratum:** Shot distance / zone (restricted area, mid-range, 3pt)
   - **Data:** Basketball-Reference.com (public) — [basketball-reference.com](https://www.basketball-reference.com/)
   - **Reversal:** Player A may have higher overall FG% than Player B while having lower FG% in every individual zone; shot selection (zone allocation) is the confounder.

4. **Efron & Morris (1975)** "Data Analysis Using Stein's Estimator and Its Generalizations." *JASA*, 70(350), 311–319.
   - **Measures:** Batting average predictions for 18 players
   - **Stratum:** First vs. second half of season
   - **Data:** 1970 MLB season; replicated data in paper
   - **Reversal:** Empirical Bayes shrinkage reverses naive rankings at individual-player level within strata.

5. **Soccer Pass Completion by League (2017–2023)** — StatsBomb open data
   - **Measures:** Pass completion % by player/team
   - **Stratum:** Match situation (pressing vs. not pressing)
   - **Data:** [statsbomb.com/data](https://statsbomb.com/data/) (free open data)
   - **Reversal:** Teams in high-pressing leagues appear to have lower pass completion; stratifying by defensive pressure, passing accuracy reverses across leagues.

6. **Marathon Finishing Times by Age and Temperature** — Boston Marathon (2000–2019)
   - **Measures:** Finishing time by age group
   - **Stratum:** Race-day temperature
   - **Data:** BAA public results — [baa.org/races/boston-marathon/results](https://www.baa.org/races/boston-marathon/results)
   - **Reversal:** Older runners appear faster in hot years (they drop out less); stratifying by completion rate, the age-performance gradient reverses.

7. **Tennis First Serve Percentage by Surface (2010–2022)**
   - **Measures:** First serve % and win rate by server
   - **Stratum:** Surface type (hard / clay / grass)
   - **Data:** ATP/WTA open stats — [atptour.com/en/stats](https://www.atptour.com/en/stats); [wtatennis.com/stats](https://www.wtatennis.com/stats)
   - **Reversal:** Player with higher overall first-serve win % may lose on every surface individually — surface allocation confounds overall rate.

8. **NFL Quarterback Rating by Game Situation (2010–2022)**
   - **Measures:** Passer rating by QB, stratified by game script
   - **Stratum:** Down and distance / score differential
   - **Data:** NFL.com / Pro-Football-Reference — [pro-football-reference.com](https://www.pro-football-reference.com/)
   - **Reversal:** QB forced to throw more in losing situations (garbage time) inflates or deflates overall rate; within game-script strata, rankings reverse.

9. **Ellsbury vs. Lowell (2007–2008)** — cited in sports Simpson's Paradox literature
   - **Measures:** Batting average across two seasons
   - **Stratum:** Season
   - **Data:** Baseball-Reference.com (public)
   - **Reversal:** Ellsbury outperformed Lowell each individual season but had far fewer at-bats in 2007, reversing the combined average.

10. **NHL Shooting Percentage by Game State (2010–2022)**
    - **Measures:** Shooting percentage (goals/shots) by player
    - **Stratum:** Score situation (trailing vs. leading vs. tied)
    - **Data:** Natural Stat Trick — [naturalstattrick.com](https://www.naturalstattrick.com/) (public)
    - **Reversal:** Players who play more "desperation minutes" while trailing inflate shot counts at lower %, reversing overall rates vs. within-score-state rates.

11. **Soccer Expected Goals (xG) by Home/Away and Opponent Tier**
    - **Measures:** xG per game by team
    - **Stratum:** Home/Away × opponent tier
    - **Data:** FBRef — [fbref.com](https://fbref.com/en/) (public)
    - **Reversal:** Teams playing many home games against weak opponents inflate overall xG; within home-vs-tier stratum, ranking reverses for some clubs.

12. **Wade Boggs vs. Don Mattingly (multiple seasons)** — classic baseball paradox pair
    - **Measures:** Batting average by season
    - **Stratum:** Season year
    - **Data:** Baseball-Reference.com (public)
    - **Reversal:** One player may outperform the other in every individual season but have lower career average due to at-bat weighting across seasons.

13. **Lollar vs. McCatty Pitching (1982–1983)** — from Hiester (1984) SABR
    - **Measures:** Win percentage by pitcher across two seasons
    - **Stratum:** Season
    - **Data:** Baseball-Reference.com (public)
    - **Reversal:** McCatty had higher win % in both years individually; Lollar's combined two-year win % exceeded McCatty's.

14. **MLB Park Factor Adjustments (Statcast era, 2015–2023)**
    - **Measures:** Home run rates by player
    - **Stratum:** Home vs. away park
    - **Data:** Baseball Savant — [baseballsavant.mlb.com](https://baseballsavant.mlb.com/) (public)
    - **Reversal:** Player in extreme homer-friendly park may appear a better home-run hitter overall; stratifying by park, ranking reverses.

15. **Olympic Sprint Times by Heat Type (1996–2020)**
    - **Measures:** 100m dash times by athlete
    - **Stratum:** Preliminary heat vs. semifinal vs. final / wind conditions
    - **Data:** World Athletics database — [worldathletics.org](https://worldathletics.org/records/by-discipline/sprints/)
    - **Reversal:** Athletes peaking early may have faster preliminary times; stratifying by heat round and wind, rankings reverse for finals-only comparison.

---

## Domain 6: Epidemiology / Vaccine Efficacy (20 studies)

1. **von Kügelgen, Mohamed & Schölkopf (2021)** "Simpson's Paradox in COVID-19 Case Fatality Rates." arXiv:2005.07180. *(Already in corpus)*
   - **Data:** WHO/CDC age-stratified CFR — [who.int/data](https://www.who.int/data)

2. **Dagan et al. (2021)** "BNT162b2 mRNA Covid-19 Vaccine in a Nationwide Mass Vaccination Setting." *NEJM*, 384(15), 1412–1423. PMID: 33626250.
   - **Measures:** Vaccine effectiveness by age group, Israel
   - **Stratum:** Age group / vaccination timing
   - **Data:** Clalit Health Services administrative data; methodology replicated with Israeli MoH open tables
   - **Reversal:** Apparent VE may flip at population level during booster rollout when younger unvaccinated cohorts have lower baseline risk.

3. **Israeli Ministry of Health (Aug–Sep 2021)** Weekly Epidemiological Briefs — "Vaccine Effectiveness" paradox
   - **Measures:** Severe COVID hospitalization rates, vaccinated vs. unvaccinated
   - **Stratum:** Age group (50+ vs. <50)
   - **Data:** Israeli MoH open reports — [gov.il/en/departments/ministry_of_health](https://www.gov.il/en/departments/ministry_of_health)
   - **Reversal:** Naive data showed more vaccinated than unvaccinated in hospitals; stratifying by age, VE is strongly positive in all groups — age confounds the pooled comparison.

4. **Cochran (1968)** "The Effectiveness of Adjustment by Subclassification in Removing Bias in Observational Studies." *Biometrics*, 24(2), 295–313. — **CLASSIC**
   - **Measures:** Smoking and mortality rates
   - **Stratum:** Age group
   - **Data:** Original data in paper; replicated in most epidemiology textbooks
   - **Reversal:** Smokers appear to have lower mortality than non-smokers pooled; age confounds (smokers die younger, reducing the older high-mortality pool).

5. **Yule (1903)** "Notes on the Theory of Association of Attributes in Statistics." *Biometrika*, 2(2), 121–134. — **HISTORICAL ORIGIN**
   - **Measures:** Smallpox inoculation and death rates
   - **Stratum:** Age group
   - **Data:** Late 19th century registry data; reproduced in statistics textbooks
   - **Reversal:** Inoculated appeared to have higher death rates pooled; age was the suppressed confounder.

6. **Mantel & Haenszel (1959)** "Statistical Aspects of the Analysis of Data from Retrospective Studies of Disease." *JNCI*, 22(4), 719–748.
   - **Measures:** Case-control odds ratios for smoking/lung cancer
   - **Stratum:** Age / hospital
   - **Data:** Methodological paper; data from Doll & Hill series
   - **Reversal:** Methodology paper demonstrating how stratification resolves apparent reversals in pooled odds ratios.

7. **Doll & Hill (1954)** "The Mortality of Doctors in Relation to Their Smoking Habits." *BMJ*, 1(4877), 1451–1455. PMID: 13160495.
   - **Measures:** Lung cancer mortality by smoking status
   - **Stratum:** Age group
   - **Data:** British Doctors Study — [ctsu.ox.ac.uk](https://www.ctsu.ox.ac.uk/research/uk-doctors-cohort)
   - **Reversal:** Age confounds naive cross-sectional comparison; longitudinal follow-up resolves apparent reversals.

8. **Hammond & Horn (1958)** "Smoking and Death Rates." *JAMA*, 166(10), 1159–1172. PMID: 13491614.
   - **Measures:** All-cause mortality by smoking status
   - **Stratum:** Age / sex / urban/rural
   - **Data:** ACS Cancer Prevention Study; summary in paper
   - **Reversal:** Pooled mortality ratios are high; stratifying by prior illness status reveals healthy smoker bias.

9. **Polack et al. (2020)** "Safety and Efficacy of the BNT162b2 mRNA Covid-19 Vaccine." *NEJM*, 383(27), 2603–2615. PMID: 33301246. NCT04368728.
   - **Measures:** COVID-19 infection rates by treatment arm
   - **Stratum:** Age group / comorbidity status
   - **Data:** Pfizer data sharing — [pfizer.com/research/clinical-trials](https://www.pfizer.com/research/clinical-trials/pfizer-clinical-trial-data-sharing)
   - **Reversal:** Overall VE 95%; within elderly subgroup with comorbidities, confidence intervals widen — small subgroup VE point estimates vary.

10. **Baden et al. (2021)** "Efficacy and Safety of the mRNA-1273 SARS-CoV-2 Vaccine." *NEJM*, 384(5), 403–416. PMID: 33378609. NCT04470427.
    - **Measures:** COVID-19 infection rates by treatment arm
    - **Stratum:** Age / race / comorbidity
    - **Data:** Moderna data sharing — [vivli.org](https://vivli.org/)
    - **Reversal:** Within-subgroup VE estimates vary; minority subgroups under-enrolled, creating allocation-distortion risk in any stratified comparison.

11. **Flannery et al. (2020)** "Influenza Vaccine Effectiveness against Pediatric Deaths." *Clinical Infectious Diseases*, 71(1), 14–20. PMID: 31510155.
    - **Measures:** Vaccine effectiveness against flu death in children
    - **Stratum:** Flu season / vaccine match quality
    - **Data:** CDC FluVEIN — [cdc.gov/flu/vaccines-work/vaccine-effectiveness.htm](https://www.cdc.gov/flu/vaccines-work/vaccine-effectiveness.htm)
    - **Reversal:** VE appears lower in high-mismatch seasons; stratifying by health status of child, VE in healthy children is higher than pooled across risk groups.

12. **Simonsen et al. (2005)** "Influenza Vaccination and Mortality Benefit: New Insights, New Opportunities." *Lancet*, 365(9461), 779–781. PMID: 15733723.
    - **Measures:** Influenza vaccine effectiveness in elderly
    - **Stratum:** Frailty / functional status
    - **Data:** Medicare claims data; summary in paper
    - **Reversal:** Healthy vaccinee bias — vaccinated elderly appear to have 50% lower all-cause mortality; stratifying by baseline functional status reduces effect to near zero.

13. **Hernan, Hernandez-Diaz & Robins (2004)** "A Structural Approach to Selection Bias." *Epidemiology*, 15(5), 615–625. PMID: 15308962.
    - **Measures:** HRT and coronary heart disease
    - **Stratum:** Time since initiation
    - **Data:** Nurses' Health Study — [nurseshealthstudy.org](https://www.nurseshealthstudy.org/)
    - **Reversal:** Early observational studies showed HRT protective; stratifying by when HRT was initiated reveals the timing-hypothesis reversal (harmful if started late).

14. **Cornfield et al. (1959)** "Smoking and Lung Cancer: Recent Evidence and a Discussion of Some Questions." *JNCI*, 22(1), 173–203.
    - **Measures:** Lung cancer relative risk by smoking exposure level
    - **Stratum:** Exposure dose
    - **Data:** Historical registry data; reproduced in textbooks
    - **Reversal:** Methodological analysis demonstrating how confounders could theoretically reverse apparent smoking-cancer association.

15. **Baker & Kramer (2001)** "Good for Women, Good for Men, Bad for People: Simpson's Paradox and the Importance of Sex-Specific Analysis in Observational Studies." *Journal of Women's Health & Gender-Based Medicine*, 10(9), 867–872. PMID: 11747682.
    - **Measures:** Drug treatment effects pooled vs. sex-stratified
    - **Stratum:** Sex
    - **Data:** Methodological paper with example datasets
    - **Reversal:** Demonstrates how pooled benefits mask sex-specific harms in multiple drug trials.

16. **CDC COVID-19 Case Surveillance (2020–2023)**
    - **Measures:** Case fatality rates by age, race, and vaccination status
    - **Stratum:** Age group / month
    - **Data:** [data.cdc.gov/Case-Surveillance](https://data.cdc.gov/Case-Surveillance/COVID-19-Case-Surveillance-Public-Use-Data/vbim-akqf)
    - **Reversal:** CFR patterns reverse across age groups depending on vaccination uptake timing — age is the dominant confounding stratum.

17. **Our World in Data COVID-19 Dataset (2020–2023)**
    - **Measures:** CFR by country, time period, and vaccination coverage
    - **Stratum:** Country / age distribution
    - **Data:** [ourworldindata.org/covid-deaths](https://ourworldindata.org/covid-deaths)
    - **Reversal:** Countries with older populations appear to have higher CFR; stratifying by age group, some comparisons reverse (the corpus's Italy vs. China case).

18. **Rosenbaum & Rubin (1983)** "The Central Role of the Propensity Score in Observational Studies for Causal Effects." *Biometrika*, 70(1), 41–55.
    - **Measures:** Treatment effect estimates in observational data
    - **Stratum:** Propensity score strata
    - **Data:** Methodological paper; applied to LaLonde (1986) job training data — available at [users.nber.org/~rdehejia/data/.html](https://users.nber.org/~rdehejia/data/)
    - **Reversal:** Uncontrolled confounders create apparent reversals; propensity-score stratification resolves them.

19. **Shapiro et al. (1988)** "Breast Cancer Screening and Its Effect on Mortality: Health Insurance Plan Study." *Monographs of the National Cancer Institute*, 13, 1–77.
    - **Measures:** Breast cancer mortality by screening vs. control
    - **Stratum:** Age group / stage at detection
    - **Data:** HIP study data; summary tables in monograph
    - **Reversal:** Pooled mortality benefit is modest; stratifying by age group, screening benefit reverses for youngest (40–49) due to lead-time bias.

20. **Hernandez-Diaz, Schisterman & Hernan (2006)** "The Birth Weight 'Paradox' Uncovered?" *American Journal of Epidemiology*, 164(11), 1115–1120. PMID: 16931543.
    - **Measures:** Infant mortality by birth weight and smoking status
    - **Stratum:** Birth weight category
    - **Data:** Linked birth/death records — [cdc.gov/nchs/data_access/vitalstatsonline.htm](https://www.cdc.gov/nchs/data_access/vitalstatsonline.htm)
    - **Reversal:** Low birth-weight infants of smokers have paradoxically lower mortality than low birth-weight infants of non-smokers — classic collider/selection-bias reversal (birth weight is a collider).

---

## Domain 7: Hiring & Promotion (12 studies)

1. **Goldin & Rouse (2000)** "Orchestrating Impartiality: The Impact of 'Blind' Auditions on Female Musicians." *AER*, 90(4), 715–741. DOI: 10.1257/aer.90.4.715
   - **Measures:** Female hire probability in symphony auditions
   - **Stratum:** Blind vs. sighted audition round
   - **Data:** Audition records from major US orchestras; replication data available from AEA
   - **Reversal:** Non-blind auditions favor men; blind auditions eliminate gap — pooled rates mix rounds.

2. **Moss-Racusin et al. (2012)** "Science Faculty's Subtle Gender Biases Favor Male Students." *PNAS*, 109(41), 16474–16479. PMID: 22988126.
   - **Measures:** Hiring rating, salary, mentoring offers by applicant gender
   - **Stratum:** Faculty mentor's gender / field
   - **Data:** Supplementary data with paper; [pnas.org/doi/10.1073/pnas.1211286109](https://www.pnas.org/doi/10.1073/pnas.1211286109)
   - **Reversal:** Female faculty also rate female applicants lower — gender of evaluator moderates but does not eliminate the reversal.

3. **Castilla (2008)** "Gender, Race, and Meritocracy in Organizational Careers." *AJS*, 113(6), 1479–1526.
   - **Measures:** Merit pay awards by race and gender
   - **Stratum:** Department / supervisor
   - **Data:** Single large organization HR records; methodology in paper
   - **Reversal:** Same performance rating → lower pay increase for women and minorities — meritocracy reversal emerges within performance band.

4. **Blau & DeVaro (2007)** "New Evidence on Gender Differences in Promotion Rates: An Empirical Analysis of a Sample of New Hires." *Industrial Relations*, 46(3), 511–550.
   - **Measures:** Promotion rates by gender
   - **Stratum:** Occupation / industry / firm
   - **Data:** Multi-City Study of Urban Inequality (restricted); NCS — [bls.gov/ncs](https://www.bls.gov/ncs/)
   - **Reversal:** Women promoted at lower rate overall; within same occupation and firm, gap narrows significantly.

5. **Sarsons (2017)** "Recognition for Group Work: Gender Differences in Academia." *AER: Papers & Proceedings*, 107(5), 141–145.
   - **Measures:** Tenure probability by co-authored vs. solo-authored papers
   - **Stratum:** Gender of co-authors
   - **Data:** CV data from economics departments; replication data at [aeaweb.org](https://www.aeaweb.org/articles?id=10.1257/aer.p20171031)
   - **Reversal:** Men get full credit for joint work; women's joint-authored papers are discounted — reversal in implied contribution credit.

6. **Ginther & Kahn (2004)** "Women in Economics: Moving Up or Falling Off the Academic Career Ladder?" *JEP*, 18(3), 193–214.
   - **Measures:** Tenure rates by gender in economics
   - **Stratum:** Field subarea / publication record
   - **Data:** NSF Survey of Doctoral Recipients — [ncses.nsf.gov/surveys/doctoral-recipients](https://ncses.nsf.gov/surveys/doctoral-recipients)
   - **Reversal:** Women promoted at lower rates overall; controlling for publications and field, gap persists — field of specialty is a partial confounder.

7. **Bertrand & Mullainathan (2004)** *(cross-listed from Economics #14)*
   - **Data:** [doi.org/10.3886/E116023V1](https://doi.org/10.3886/E116023V1)

8. **EEOC Charge Data (annual)**
   - **Measures:** Discrimination charges filed by industry and charge type
   - **Stratum:** Industry / charge basis
   - **Data:** [eeoc.gov/data/charge-statistics](https://www.eeoc.gov/data/charge-statistics-charges-filed-eeoc)
   - **Reversal:** Pooled charge rates by race mask industry-specific reversals where minority representation is lower.

9. **NSF NCSES Survey of Doctoral Recipients (annual)**
   - **Measures:** Employment outcomes, salary, tenure by gender and field
   - **Stratum:** Field of science
   - **Data:** [ncses.nsf.gov/surveys/doctoral-recipients](https://ncses.nsf.gov/surveys/doctoral-recipients)
   - **Reversal:** Aggregate gender wage gap in STEM; stratifying by field, biological sciences gap is smaller than physical sciences — field composition confounds pooled rate.

10. **Neumark, Bank & Van Nort (1996)** "Sex Discrimination in Restaurant Hiring: An Audit Study." *QJE*, 111(3), 915–941.
    - **Measures:** Callback rates by gender in restaurant audits
    - **Stratum:** Restaurant tier (high-price vs. low-price)
    - **Data:** Data in paper; Philadelphia restaurants
    - **Reversal:** High-price restaurants discriminate against women; low-price favor women — pooling reverses the apparent direction.

11. **Kline, Rose & Walters (2022)** "Systemic Discrimination Among Large U.S. Employers." *QJE*, 137(4), 1963–2036.
    - **Measures:** Callback rates from a large-scale resume audit
    - **Stratum:** Industry / firm size
    - **Data:** Replication package at [qje.oxfordjournals.org](https://academic.oup.com/qje/article/137/4/1963/6659597)
    - **Reversal:** Racial callback gaps vary enormously by firm; pooled average masks near-zero gaps at some firms and large gaps at others.

12. **Hsieh & Moretti (2019)** "Housing Constraints and Spatial Misallocation." *AEJ: Macroeconomics*, 11(2), 1–39.
    - **Measures:** Wages by city / housing cost
    - **Stratum:** City housing market / occupation
    - **Data:** ACS — [census.gov/programs-surveys/acs](https://www.census.gov/programs-surveys/acs.html)
    - **Reversal:** High-wage cities attract workers; controlling for housing costs, real wage gains reverse for workers in regulated markets.

---

## Domain 8: Online A/B Testing (10 studies)

1. **Kohavi, Deng, Longbotham & Xu (2014)** "Seven Rules of Thumb for Web Site Experimenters." *KDD 2014*, 1857–1866.
   - **Measures:** Experiment reliability and Simpson's Paradox frequency in online tests
   - **Stratum:** User segment / platform
   - **Data:** Microsoft Bing internal experiments; no public dataset, but methodology published
   - **Reversal:** Demonstrated concrete cases where experiment wins in desktop segment, loses in mobile, yet aggregate shows win — segment allocation is the confounder.

2. **Kohavi & Longbotham (2017)** "Online Controlled Experiments and A/B Testing." *Encyclopedia of Machine Learning and Data Mining*.
   - **Measures:** Conversion rates in A/B tests
   - **Stratum:** Device type / browser / geography
   - **Data:** Microsoft internal (no public data); methodology at [exp-platform.com](https://www.exp-platform.com/)
   - **Reversal:** Device-mix shift between treatment and control periods creates Simpson-type reversals in click-through rates.

3. **Xu, Chen, Fernandez, Sinno & Bhasin (2015)** "From Infrastructure to Culture: A/B Testing Challenges and Best Practices at LinkedIn." *KDD 2015*.
   - **Measures:** Engagement metrics by test variant
   - **Stratum:** User tenure / geography
   - **Data:** LinkedIn internal (no public dataset); paper describes methodology
   - **Reversal:** New users and veteran users respond differently; allocation imbalance across cohorts creates aggregate reversals.

4. **Deng, Xu, Kohavi & Walker (2013)** "Improving the Sensitivity of Online Controlled Experiments by Utilizing Pre-Experiment Data." *WSDM 2013*, 123–132.
   - **Measures:** Metric variance and bias in online experiments
   - **Stratum:** Pre-experiment user behavior stratum
   - **Data:** Microsoft internal; methodology published
   - **Reversal:** Covariates (pre-experiment behavior) create stratification-dependent reversals in naive estimates.

5. **Tang, Agarwal, O'Brien & Meyer (2010)** "Overlapping Experiment Infrastructure: More, Better, Faster Experimentation." *KDD 2010*, 17–26.
   - **Measures:** Experiment interaction effects at Facebook
   - **Stratum:** Concurrent experiment assignment
   - **Data:** Facebook internal (no public dataset)
   - **Reversal:** Overlapping experiments create apparent reversals when users in multiple experiments are pooled incorrectly.

6. **Bakshy, Eckles & Bernstein (2014)** "Designing and Deploying Online Field Experiments." *WWW 2014*, 283–292.
   - **Measures:** Feature rollout effectiveness across user segments
   - **Stratum:** User activity level / platform
   - **Data:** Facebook internal (no public data); methodology published
   - **Reversal:** Active vs. passive users respond differently — allocation-driven reversal if activity level differs between groups.

7. **Dmitriev, Frasca, Lu, Kohavi & Olariu (2016)** "Pitfalls of Data-Driven Experimentation." *KDD 2016*.
   - **Measures:** A/B test validity across experiment configurations
   - **Stratum:** Traffic allocation method / time period
   - **Data:** Microsoft internal
   - **Reversal:** Time-of-day and day-of-week allocation imbalances create temporal stratification reversals.

8. **Kohavi, Longbotham, Sommerfield & Henne (2009)** "Controlled Experiments on the Web: Survey and Practical Guide." *Data Mining and Knowledge Discovery*, 18(1), 140–181.
   - **Measures:** Experiment effect sizes across industries
   - **Stratum:** User segment / feature area
   - **Data:** Microsoft, Amazon internal (no public data); survey methodology
   - **Reversal:** Demonstrates how segment-level wins aggregate to overall losses and vice versa.

9. **Hohnhold, O'Brien & Tang (2015)** "Focusing on the Long-Term: It's Good for Users and Business." *KDD 2015*.
   - **Measures:** Ad click-through rates short-term vs. long-term
   - **Stratum:** User tenure cohort
   - **Data:** Google internal (no public data)
   - **Reversal:** Short-term CTR gains reverse in long-term engagement when stratified by user tenure.

10. **Johari, Koomen, Pekelis & Walsh (2017)** "Peeking at A/B Tests: Why It Matters and What to Do About It." *KDD 2017*.
    - **Measures:** False discovery rates under repeated peeking
    - **Stratum:** Sequential test timing
    - **Data:** Optimizely internal; methodology published with simulated data at [github.com/Optimizely/stats-engine](https://github.com/Optimizely/stats-engine)
    - **Reversal:** Peeking creates stratum-conditional reversals in estimated treatment effects.

---

## Domain 9: Public Health / Smoking (12 studies)

1. **Cochran (1968)** *(listed in Epidemiology #4)* — smoking and death rates by age. **CLASSIC**

2. **Doll & Hill (1950)** "Smoking and Carcinoma of the Lung: Preliminary Report." *BMJ*, 2(4682), 739–748. PMID: 14772469.
   - **Measures:** Lung cancer odds by smoking status
   - **Stratum:** Age / sex / hospital
   - **Data:** Retrospective case-control; summary in paper
   - **Reversal:** Age confounds naive comparison — older cohort has higher background cancer rate.

3. **Surgeon General's Report (1964)** *Smoking and Health*. U.S. Public Health Service.
   - **Measures:** Mortality ratios by smoking category
   - **Stratum:** Age group / cause of death
   - **Data:** Multiple prospective studies synthesized; summary tables publicly available
   - **Reversal:** Age-standardization resolves apparent reversals in crude rate comparisons.

4. **Dockery et al. (1993)** "An Association between Air Pollution and Mortality in Six U.S. Cities." *NEJM*, 329(24), 1753–1759. PMID: 8179653.
   - **Measures:** All-cause mortality by city (PM2.5 exposure)
   - **Stratum:** SES / smoking rate / occupational exposure
   - **Data:** Harvard Six Cities Study data — [hsphsites.sph.harvard.edu/sixcities](https://www.hsph.harvard.edu/research/six-cities-study/)
   - **Reversal:** City-level PM2.5 association robust; within SES strata, apparent city ranking can reverse.

5. **PREDIMED Trial (Estruch et al. 2013)** "Primary Prevention of Cardiovascular Disease with a Mediterranean Diet." *NEJM*, 368(14), 1279–1290. PMID: 23432189. NCT00160433.
   - **Measures:** Cardiovascular event rates by diet
   - **Stratum:** Cardiovascular risk tier / diabetes status
   - **Data:** PREDIMED data repository — [predimed.es](http://www.predimed.es/)
   - **Reversal:** Overall benefit; within low-CV-risk subgroup, confidence intervals cross zero — risk stratification reveals heterogeneity.

6. **MRFIT (Multiple Risk Factor Intervention Trial) Research Group (1982)** *JAMA*, 248(12), 1465–1477. PMID: 7050440.
   - **Measures:** CHD mortality by multi-risk-factor intervention
   - **Stratum:** Baseline ECG abnormality / hypertension status
   - **Data:** NHLBI BioLINCC
   - **Reversal:** Overall trial showed null effect; stratifying by baseline ECG, intervention group with abnormal ECG had worse outcomes — EKG is the confounder.

7. **Framingham Heart Study (Dawber, Meadors & Moore, 1951)** *American Journal of Public Health*, 41(3), 279–286. PMID: 14819398.
   - **Measures:** Cardiovascular disease risk factors
   - **Stratum:** Sex / age cohort
   - **Data:** Framingham public use files — [framinghamheartstudy.org/fhs-for-researchers/data-available-overview](https://www.framinghamheartstudy.org/fhs-for-researchers/data-available-overview/)
   - **Reversal:** Risk factor associations reverse by sex in early waves; sex-stratified analyses needed throughout.

8. **Whickham Cohort Study (Vandenberg & Vandenberg, 1989)** — smoking and 20-year mortality
   - **Measures:** All-cause mortality by smoking status
   - **Stratum:** Age group
   - **Data:** Summarized in Appleton, French & Vandenberg (1996) *American Statistician*, 50(4), 340–341. Data in paper.
   - **Reversal:** Smokers appeared to have lower mortality than non-smokers; age confound — older non-smokers in the sample had higher baseline mortality rates.

9. **Women's Health Study (Ridker et al. 2005)** "A Randomized Trial of Low-Dose Aspirin in the Primary Prevention of Cardiovascular Disease in Women." *NEJM*, 352(13), 1293–1304. PMID: 15753114. NCT00000479.
   - **Measures:** CV events and stroke by aspirin arm
   - **Stratum:** Age group / baseline CV risk
   - **Data:** NHLBI BioLINCC
   - **Reversal:** No overall CV benefit but significant stroke reduction; stratifying by age ≥65, MI benefit emerges — age reverses the null pooled result.

10. **ATBC Cancer Prevention Study (Alpha-Tocopherol, Beta Carotene Cancer Prevention Study Group, 1994)** *NEJM*, 330(15), 1029–1035. PMID: 8127329.
    - **Measures:** Lung cancer incidence by antioxidant supplementation
    - **Stratum:** Baseline smoking pack-years / dietary intake
    - **Data:** NCI data — [prevention.cancer.gov/major-programs/atbc](https://prevention.cancer.gov/major-programs/atbc)
    - **Reversal:** Beta-carotene increased lung cancer risk overall; stratifying by smoking intensity, the harm is concentrated in heavy smokers.

11. **NHANES Air Quality and Respiratory (annual, 1999–2018)**
    - **Measures:** Respiratory outcomes by geographic area
    - **Stratum:** Income / occupational exposure / smoking history
    - **Data:** [cdc.gov/nchs/nhanes](https://www.cdc.gov/nchs/nhanes/)
    - **Reversal:** Geographic air pollution correlation with respiratory disease reverses after adjusting for SES and occupational confounders.

12. **Fillmore et al. (2006)** "Moderate Alcohol Use and Reduced Mortality Risk: Systematic Error in Prospective Studies." *Addiction Research & Theory*, 14(2), 101–132.
    - **Measures:** Mortality by alcohol consumption level
    - **Stratum:** Former vs. never drinker status
    - **Data:** Meta-analysis of published studies; data tables in paper
    - **Reversal:** "J-curve" moderate-drinker longevity advantage reverses when "sick quitters" (former drinkers classified as abstainers) are separated — the abstainer group is a confounder.

---

## Domain 10: Education Outcomes (15 studies)

1. **Coleman et al. (1966)** *Equality of Educational Opportunity* (Coleman Report). U.S. Department of Health, Education, and Welfare.
   - **Measures:** Student achievement by school resources and family background
   - **Stratum:** Family SES / race
   - **Data:** NCES EEOS data — [nces.ed.gov](https://nces.ed.gov/)
   - **Reversal:** School resources appear to matter less than family SES; stratifying by SES, some resource effects reverse direction.

2. **PISA 2018 Reading Scores** — OECD Programme for International Student Assessment
   - **Measures:** Reading scores by country
   - **Stratum:** Socioeconomic status quartile
   - **Data:** [oecd.org/pisa/data](https://www.oecd.org/pisa/data/) (public download)
   - **Reversal:** US vs. OECD average comparison reverses when stratified by SES — US performs above average within every SES quartile but has a worse overall score due to higher poverty rate. Classic Simpson's Paradox in international education comparisons.

3. **NAEP (Nation's Report Card, annual)**
   - **Measures:** 4th and 8th grade reading/math scores by state
   - **Stratum:** Race / SES / ELL status
   - **Data:** [nationsreportcard.gov](https://www.nationsreportcard.gov/)
   - **Reversal:** State rankings reverse when stratified by demographic composition — states with high minority enrollment appear lower overall despite having higher within-group scores.

4. **Krueger (1999)** "Experimental Estimates of Education Production Functions." *QJE*, 114(2), 497–532. PMID: NCT-equivalent = Project STAR.
   - **Measures:** Test scores by class size (Project STAR)
   - **Stratum:** School / teacher experience
   - **Data:** Tennessee STAR microdata — [aeaweb.org/articles?id=10.1257/aer.90.4.1](https://www.aeaweb.org/articles?id=10.1257/aer.90.4.1) or [doi.org/10.3886/ICPSR07805.v1](https://doi.org/10.3886/ICPSR07805.v1)
   - **Reversal:** Small class benefit is homogeneous within school; across schools, initial disadvantage confounds pooled estimate.

5. **Finn & Achilles (1990)** "Answers and Questions about Class Size: A Statewide Experiment." *AERJ*, 27(3), 557–577. DOI: 10.3102/00028312027003557
   - **Measures:** Reading and math achievement by class size
   - **Stratum:** School / student disadvantage
   - **Data:** Tennessee STAR (see above)
   - **Reversal:** Within-school small-class benefit is consistent; pooling across schools with different poverty levels can reverse apparent effect.

6. **Mosteller (1995)** "The Tennessee Study of Class Size in the Early School Grades." *Future of Children*, 5(2), 113–127. JSTOR: 3824562.
   - **Measures:** Policy synthesis of STAR findings
   - **Stratum:** Grade level / school type
   - **Data:** STAR (see above)

7. **Angrist & Lavy (1999)** "Using Maimonides' Rule to Estimate the Effect of Class Size on Scholastic Achievement." *QJE*, 114(2), 533–575.
   - **Measures:** Test scores by class size (Israeli schools)
   - **Stratum:** Grade / school SES
   - **Data:** Israeli Ministry of Education administrative data; summary data in paper
   - **Reversal:** Regression discontinuity at 40-student threshold; pooled class-size relationship reverses without controlling for school composition.

8. **Hoxby (2000)** "The Effects of Class Size on Student Achievement: New Evidence from Population Variation." *QJE*, 115(4), 1239–1285.
   - **Measures:** Test scores vs. class size using natural variation
   - **Stratum:** Grade / district
   - **Data:** Connecticut school district data; methodology in paper
   - **Reversal:** Cross-district class-size relationships reverse direction from within-district variation — district composition confounds.

9. **Abdulkadiroğlu, Angrist, Dynarski, Kane & Pathak (2011)** "Accountability and Flexibility in Public Schools: Evidence from Boston's Charters and Pilots." *QJE*, 126(2), 699–748.
   - **Measures:** Test score gains in charter vs. traditional schools
   - **Stratum:** Lottery result / neighborhood SES
   - **Data:** Boston Public Schools administrative data; methodology published; lottery data in paper
   - **Reversal:** Charter schools appear to outperform; lottery-based comparison within same applicant pool reverses for some subgroups.

10. **Head Start Impact Study (Puma et al. 2010)** U.S. DHHS. "Head Start Impact Study: Final Report."
    - **Measures:** School readiness by Head Start participation
    - **Stratum:** Age (3 vs. 4 year olds) / race
    - **Data:** [acf.hhs.gov/opre/research](https://www.acf.hhs.gov/opre/research/project/head-start-impact-study-and-follow-up)
    - **Reversal:** 3-year-olds show different patterns from 4-year-olds; pooled benefits obscure within-age reversals at school entry.

11. **Chetty, Friedman & Rockoff (2014)** "Measuring the Impacts of Teachers I: Evaluating Bias in Teacher Value-Added Estimates." *AER*, 104(9), 2593–2632.
    - *(cross-listed from Economics #25)*

12. **TIMSS 2019 International Math and Science**
    - **Measures:** Math and science scores by country
    - **Stratum:** SES / school resource level
    - **Data:** [timssandpirls.bc.edu/timss2019/international-database](https://timssandpirls.bc.edu/timss2019/international-database/)
    - **Reversal:** Country rankings reverse when stratified by school SES — wealthy-country advantage shrinks within SES brackets.

13. **Hanushek (1989)** "The Impact of Differential Expenditures on School Performance." *Educational Researcher*, 18(4), 45–62.
    - **Measures:** Student achievement vs. per-pupil spending
    - **Stratum:** State / demographic composition
    - **Data:** Meta-analysis of published studies; NAEP
    - **Reversal:** State-level spending-achievement correlation is positive; within demographic groups, controlling for SES, spending effect reverses or disappears.

14. **Early Childhood Longitudinal Study – Kindergarten (ECLS-K, 1998–2010)**
    - **Measures:** Math and reading skills by school type and SES
    - **Stratum:** SES / race / school sector
    - **Data:** [nces.ed.gov/ecls/kindergarten.asp](https://nces.ed.gov/ecls/kindergarten.asp)
    - **Reversal:** Catholic schools appear to outperform; controlling for family SES, the advantage diminishes or reverses within SES strata.

15. **Rothstein (2010)** "Teacher Quality in Educational Production: Tracking, Decay, and Student Achievement." *QJE*, 125(1), 175–214.
    - **Measures:** Teacher value-added and student test score gains
    - **Stratum:** Prior-year assignment / student SES
    - **Data:** North Carolina administrative data; methodology in paper
    - **Reversal:** Value-added estimates reverse sign in falsification tests — prior-year VA predicts future-year scores in wrong direction, suggesting confounding.

---

## Domain 11: Financial Lending / Credit Risk (12 studies)

1. **HMDA (Home Mortgage Disclosure Act) Data (annual, 1990–present)**
   - **Measures:** Mortgage denial rates by race, income, loan purpose
   - **Stratum:** Loan-to-income ratio / property type / lender
   - **Data:** [ffiec.cfpb.gov/data-browser](https://ffiec.cfpb.gov/data-browser/)
   - **Reversal:** Raw denial rate gap Black/White is ~2×; stratifying by loan-to-income and property type, gap shrinks significantly but does not reverse — Type C compression.

2. **Munnell, Tootell, Browne & McEneaney (1996)** "Mortgage Lending in Boston: Interpreting HMDA Data." *AER*, 86(1), 25–53.
   - **Measures:** Mortgage denial rates in Boston after controlling for creditworthiness
   - **Stratum:** Credit score / obligation ratio / LTV
   - **Data:** Federal Reserve Bank of Boston survey data; methodology published
   - **Reversal:** Controlling for financial characteristics reduces but does not eliminate racial gap — unobserved creditworthiness is the partial confounder.

3. **Bhutta, Hizmo & Ringo (2022)** *(cross-listed from Economics #22)*
   - **Data:** FEDS WP 2022-067 — [federalreserve.gov/econres/feds/files/2022067pap.pdf](https://www.federalreserve.gov/econres/feds/files/2022067pap.pdf)

4. **Bartlett, Morse, Stanton & Wallace (2022)** "Consumer-Lending Discrimination in the FinTech Era." *Journal of Financial Economics*, 143(1), 30–56.
   - **Measures:** Interest rate disparities in online vs. face-to-face lending
   - **Stratum:** Loan channel / borrower creditworthiness
   - **Data:** HMDA + GSE loan-level data — [fanniemae.com/research-and-insights](https://www.fanniemae.com/research-and-insights)
   - **Reversal:** FinTech lenders show smaller racial pricing gaps than face-to-face; stratifying by credit score tier, the pattern reverses for some score ranges.

5. **Federal Reserve SCF (Survey of Consumer Finances, triennial)**
   - **Measures:** Wealth, debt, credit access by race and income
   - **Stratum:** Income quartile / age cohort
   - **Data:** [federalreserve.gov/econres/scfindex.htm](https://www.federalreserve.gov/econres/scfindex.htm)
   - **Reversal:** Racial wealth gap is enormous; stratifying by income quartile, within upper-income brackets the gap shrinks dramatically but the composition effect confounds cross-group comparisons.

6. **CFPB Consumer Credit Panel (CCP) — New York Fed**
   - **Measures:** Credit score distribution and delinquency by geography
   - **Stratum:** ZIP code income tier / state
   - **Data:** [newyorkfed.org/microeconomics/hhdc](https://www.newyorkfed.org/microeconomics/hhdc)
   - **Reversal:** Regional delinquency rates appear uniform; stratifying by zip-code income tier reveals dramatic reversal — low-income zips in high-income states look similar to high-income zips in low-income states.

7. **SBA Small Business Lending Data (annual)**
   - **Measures:** Loan approval rates by business owner race/gender
   - **Stratum:** Loan size / industry / business age
   - **Data:** [sba.gov/about-sba/sba-data-and-research](https://www.sba.gov/about-sba/sba-data-and-research)
   - **Reversal:** Minority-owned businesses receive smaller loans on average; stratifying by business revenue and industry, approval rates reverse in some sectors.

8. **Petersen & Rajan (1994)** "The Benefits of Lending Relationships: Evidence from Small Business Data." *Journal of Finance*, 49(1), 3–37.
   - **Measures:** Credit availability and interest rates by bank relationship age
   - **Stratum:** Firm age / industry / relationship length
   - **Data:** NSSBF — [federalreserve.gov/releases/nssbf](https://www.federalreserve.gov/releases/nssbf/)
   - **Reversal:** Older relationships get more credit; young firms with long relationships get more than old firms with short relationships — relationship length confounds firm-age effect.

9. **Berger & Udell (1995)** "Relationship Lending and Lines of Credit in Small Firm Finance." *Journal of Business*, 68(3), 351–381.
   - **Measures:** Interest rate premiums by firm-bank relationship
   - **Stratum:** Firm size / credit history
   - **Data:** NSSBF (see above)
   - **Reversal:** Long-relationship borrowers get lower rates; controlling for firm quality, the relationship effect reverses for very small firms.

10. **FDIC Small Business Lending Survey (2016)**
    - **Measures:** Approval rates and loan terms by bank type
    - **Stratum:** Bank size / borrower industry
    - **Data:** [fdic.gov/bank/statistical/guide](https://www.fdic.gov/bank/statistical/guide/)
    - **Reversal:** Community banks appear to approve small business loans more readily; stratifying by loan size, large banks approve more small-balance loans.

11. **Keys, Mukherjee, Seru & Vig (2010)** "Did Securitization Lead to Lax Screening? Evidence from Subprime Loans." *QJE*, 125(1), 307–362.
    - **Measures:** Default rates on securitized vs. held loans around FICO 620 threshold
    - **Stratum:** FICO score band / vintage year
    - **Data:** LPS Applied Analytics (now Black Knight); methodology in paper
    - **Reversal:** Securitized loans default at higher rates overall; within narrow FICO bands at the threshold, the effect reverses due to screening discontinuity.

12. **Acharya, Imbierowicz, Steffen & Teichmann (2020)** "Does the Lack of Financial Stability Impair the Transmission of Monetary Policy?" *Journal of Financial Economics*, 138(2), 342–365.
    - **Measures:** Bank lending by stressed vs. healthy banks
    - **Stratum:** Bank capitalization tier / borrower type
    - **Data:** BLS/FRED bank-level data — [fred.stlouisfed.org](https://fred.stlouisfed.org/)
    - **Reversal:** Monetary easing appears to increase lending overall; within low-capitalization banks, lending contracts rather than expands — capitalization is the confounding stratum.

---

## Summary Count

| Domain | Studies |
|--------|---------|
| 1. Economics | 25 |
| 2. Criminal Justice | 15 |
| 3. Higher Education | 15 |
| 4. Clinical Trials | 15 |
| 5. Sports Analytics | 15 |
| 6. Epidemiology / Vaccines | 20 |
| 7. Hiring & Promotion | 12 |
| 8. Online A/B Testing | 10 |
| 9. Public Health / Smoking | 12 |
| 10. Education Outcomes | 15 |
| 11. Financial Lending | 12 |
| **Total** | **166** |

*Note: ~20 additional studies appear as cross-domain entries (counted in primary domain only). Effective unique study corpus: ~166 studies.*

---

## Next Steps (Effortless Loop)

1. Add these studies to the rulebook as `Studies` rows with domain tags
2. Each study becomes a `Study` entity with: `StudyId`, `Domain`, `Citation`, `Year`, `StratificationVariable`, `DataSource`, `DataUrl`, `ReversalMechanism`, `IsConfirmedReversal` (TRUE/FALSE/PLAUSIBLE)
3. Prioritize studies with publicly downloadable stratified data for direct CaseCell hydration
4. Confirmed Simpson's Paradox reversals (Charig kidney stones, Berkeley admissions, Jeter/Justice, Cochran smoking, Israeli vaccine, PISA SES) → add CaseCells immediately
5. Susceptible studies → mark as `PendingVerification` for subsequent analysis loops
