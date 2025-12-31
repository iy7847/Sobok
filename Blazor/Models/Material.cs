using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    // Supabase의 "Materials" 테이블과 연결한다는 표시입니다.
    [Table("Materials")]
    public class Material : BaseModel
    {
        [PrimaryKey("id")]
        public long Id { get; set; }

        [Column("name")]
        public string Name { get; set; } = string.Empty;

        [Column("price")]
        public double Price { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}