# 📘 ACME, LLC — RuleSpeak®

_Smallest viable rulebook with a calculated field — the "Hello, formulas" tutorial._

> Deklarative Geschäftsregeln, aus dem Regelbuch gerendert. Jede Aussage
> unten drückt eine Wahrheit der Geschäftsdomäne aus — sie ist weder eine
> Prozedur noch ein Imperativ. Die Formeln des Regelbuchs sind die einzige
> Quelle der Wahrheit; dieses Dokument ist ihre klarsprachliche Lesart.

## 1 Geschäftsvokabular

| Begriff | Beschreibung | Erläuternder Kommentar |
|------|-------------|-------------------|
| **Customer** | Ein Customer wird durch Name identifiziert. | — |
| Name | Berechnet als der Email Address, wobei jedes „@“ durch ein Bindestrich ersetzt wird. | _Identifier for the customer._ |
| Email Address | Ein definiertes Attribut. | _The customer's email address_ |
| First Name | Ein definiertes Attribut. | _First Name of the customer - used to make the full name_ |
| Last Name | Ein definiertes Attribut. | _Last Name of the customer - used to make the full name_ |
| Full Name | Berechnet als die First Name, gefolgt von ein Leerzeichen, gefolgt von die Last Name. | _Full name is computed from the first and last name of the customer_ |

## 3 Operative Regeln

_Noch keine operativen Regeln. Pflichtfelder und Fremdschlüssel implizieren automatisch
strukturelle `muss`-Regeln; um semantische Verpflichtungen (`muss` / `darf nicht` / `sollte`)
zu erklären, fügen Sie eine **Constraints**-Tabelle hinzu, deren Zeilen auf boolesche
berechnete Felder zeigen. Details im README des Werkzeugs._

## 4 Definitorische Regeln

_Alle Aussagen drücken Wahrheiten der Geschäftsdomäne aus; sie sind weder Prozeduren
noch Imperative. Statt „genau dann, wenn“ wird „nur dann, wenn“ verwendet, damit eine
einseitige Notwendigkeit nicht mit einer Äquivalenz verwechselt wird. Ein
**⚠︎ mechanisch**-Hinweis markiert eine Regel, deren deterministische Formulierung treu,
aber hölzern ist — ein Signal für eine optionale Umformulierung, kein Fehler._

| ID | Deklarative Regel |
|----|------------------|
| **DR-1 Name** | Ein Customer: Name wird berechnet als der Email Address, wobei jedes „@“ durch ein Bindestrich ersetzt wird. |
| **DR-2 Full Name** | Ein Customer: Full Name wird berechnet als die First Name, gefolgt von ein Leerzeichen, gefolgt von die Last Name. |

## 5 Rückverfolgbarkeit zum Schema

_Die Ausdrucksspalte ist die Definition der Regel in RuleSpeak®-Notation —
dieselbe Logik, die das Regelbuch speichert, geschrieben für Fachleser._

| Schema-Element | Art | Ausdruck |
|----------------|------|------------|
| **Customers.Name** | Formel | `Replace(EmailAddress, "@", "-")` |
| **Customers.FullName** | Formel | `FirstName & " " & LastName` |

---

_Dieses Dokument ist in **RuleSpeak®** gerendert, der deklarativen Geschäftsregel-Notation
von **Ronald G. Ross**, und folgt den Konventionen von **SBVR** (Semantics of Business
Vocabulary and Business Rules). Mit Dank an Ronald G. Ross für RuleSpeak® und seine
grundlegende Arbeit zu Geschäftsregeln — [www.RonRoss.info](https://www.RonRoss.info)._
