using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("Expenses")]
    public class Expense : BaseModel
    {
        [PrimaryKey("id")] public long Id { get; set; }

        [Column("expense_date")] public DateTime ExpenseDate { get; set; }

        [Column("category")] public string Category { get; set; } = "일반"; // 고정비, 알바비 등

        [Column("name")] public string Name { get; set; } = string.Empty;

        [Column("amount")] public double Amount { get; set; }

        [Column("description")] public string? Description { get; set; }

        [Column("created_at")] public DateTime CreatedAt { get; set; }
    }
}