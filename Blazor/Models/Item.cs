using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;
using Newtonsoft.Json;

namespace ProfitMate_V2.Models
{
    [Table("Items")]
    public class Item : BaseModel
    {
        [PrimaryKey("id")] public long Id { get; set; }
        [Column("name")] public string Name { get; set; } = string.Empty;

        // Product(완제품), Component(반제품), Material(원자재)
        [Column("type")] public string Type { get; set; } = "Material";

        [Column("selling_price")] public double SellingPrice { get; set; }
        [Column("cost_price")] public double CostPrice { get; set; }
        [Column("created_at")] public DateTime CreatedAt { get; set; }

        // 고정비 분배를 위한 예상 월간 판매량
        [Column("estimated_monthly_sales")] public double EstimatedMonthlySales { get; set; }

        // 원자재 원가 계산용
        [Column("purchase_price")] public double PurchasePrice { get; set; }
        [Column("purchase_qty")] public double PurchaseQty { get; set; }
        [Column("purchase_unit")] public string? PurchaseUnit { get; set; }
        [Column("usage_qty")] public double UsageQty { get; set; }

        // [박일용] 추가: 나중을 위한 여유 필드 & 비고
        [Column("extra_1")] public string? Extra1 { get; set; }
        [Column("extra_2")] public string? Extra2 { get; set; }
        [Column("extra_3")] public string? Extra3 { get; set; }
        [Column("extra_4")] public string? Extra4 { get; set; }
        [Column("extra_5")] public string? Extra5 { get; set; }
        [Column("remarks")] public string? Remarks { get; set; }

        // 화면 표시용 속성 (DB 저장 안 함)
        [JsonIgnore]
        public bool ShowDetail { get; set; } = false;
    }
}