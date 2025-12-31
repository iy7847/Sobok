using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("FixedCosts")]
    public class FixedCost : BaseModel
    {
        [PrimaryKey("id")] public long Id { get; set; }

        [Column("name")] public string Name { get; set; } = string.Empty;

        [Column("amount")] public double Amount { get; set; }

        [Column("payment_day")] public int PaymentDay { get; set; } = 1;

        [Column("description")] public string? Description { get; set; } // 기존 메모

        [Column("created_at")] public DateTime CreatedAt { get; set; }

        // [박일용] 추가: 나중을 위한 여유 필드 & 추가 비고
        [Column("extra_1")] public string? Extra1 { get; set; }
        [Column("extra_2")] public string? Extra2 { get; set; }
        [Column("extra_3")] public string? Extra3 { get; set; }
        [Column("extra_4")] public string? Extra4 { get; set; }
        [Column("extra_5")] public string? Extra5 { get; set; }
        [Column("remarks")] public string? Remarks { get; set; }
    }
}