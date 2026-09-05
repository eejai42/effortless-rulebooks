
using System;
using System.Collections.ObjectModel;
using System.Collections.Specialized;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using SqlOnAir.DotNet.Lib.DataClasses;

namespace SqlOnAir.DotNet.Lib.DataClasses.BaseClasses
{
    [Table("Customers")]
    public class CustomerBase : SoAEntityBase
    {
        [Key]
        public string CustomerId { get; set; }

        // Formula Name (rulebook: =SUBSTITUTE({{EmailAddress}}, "@", "-"))
        public string? Name
        {
            get => SUBSTITUTE(this.EmailAddress, "@", "-"); set { }
        }

        public string? EmailAddress { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        // Formula FullName (rulebook: ={{FirstName}} & " " & {{LastName}})
        public string? FullName
        {
            get => this.FirstName + " " + this.LastName; set { }
        }




        protected override void LazyLoadProperties()
        {
        }

        public override string ToString()
        {
            return this.Name?.ToString() ?? base.ToString() ?? "";
        }
    }
}
