using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("ProductIngredients")]
    public class ProductIngredient : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("parent_product_id")]
        public long ParentProductId { get; set; }

        [Column("material_id")]
        public long? MaterialId { get; set; }

        [Column("component_product_id")]
        public long? ComponentProductId { get; set; }

        [Column("quantity")]
        public double Quantity { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        [Reference(typeof(Material))]
        public Material? Material { get; set; }

        // [박일용] 수정: 관계 모호성 해결
        // 반제품 정보를 가져올 때는 "ProductIngredients_component_product_id_fkey"를 사용합니다.
        [Reference(typeof(Product), ReferenceAttribute.JoinType.Left, foreignKey: "ProductIngredients_component_product_id_fkey")]
        public Product? ComponentProduct { get; set; }
    }
}