using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("Products")]
    public class Product : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("description")]
        public string? Description { get; set; }

        [Column("selling_price")]
        public double SellingPrice { get; set; }

        [Column("is_component")]
        public bool IsComponent { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        // [박일용] 수정: 관계 모호성 해결
        // Supabase에게 "ProductIngredients_parent_product_id_fkey" 제약조건을 사용하라고 명시합니다.
        [Reference(typeof(ProductIngredient), ReferenceAttribute.JoinType.Left, foreignKey: "ProductIngredients_parent_product_id_fkey")]
        public List<ProductIngredient> Ingredients { get; set; } = new();
    }
}