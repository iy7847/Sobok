using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace ProfitMate_V2.Models
{
    [Table("Profiles")]
    public class UserProfile : BaseModel
    {
        [PrimaryKey("id")] public string Id { get; set; }

        [Column("email")] public string Email { get; set; }

        [Column("name")] public string Name { get; set; } // 사용자 닉네임 또는 이름

        // --- [박일용] 사업자 필수 정보 ---

        // 상호명 (필수급): 앱 내에서 가게 이름으로 주로 쓰입니다.
        [Column("company_name")] public string? CompanyName { get; set; }

        // 대표자명 (필수급): 사업자 등록증 기준 이름
        [Column("representative_name")] public string? RepresentativeName { get; set; }

        // 사업자 등록 번호
        [Column("business_number")] public string? BusinessNumber { get; set; }

        // 사업장 주소
        [Column("address")] public string? Address { get; set; }

        // 업태/종목 (예: 요식업/카페, 제조업/용접)
        [Column("business_type")] public string? BusinessType { get; set; }

        // 연락처
        [Column("phone_number")] public string? PhoneNumber { get; set; }

        // 주문서 안내 문구 (고객에게 보여질 인사말)
        [Column("shop_notice")] public string? ShopNotice { get; set; }

        // 입금 계좌 정보
        [Column("bank_account")] public string? BankAccount { get; set; }

        // --- 구독 정보 ---
        [Column("subscription_end_date")] public DateTime? SubscriptionEndDate { get; set; }

        // [추가] 주문서 양식 설정 (JSON 데이터)
        // 폼 빌더에서 만든 항목들이 여기에 JSON 문자열로 저장됩니다.
        [Column("order_form_config")] public string? OrderFormConfig { get; set; }
    }
}