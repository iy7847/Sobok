using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using ProfitMate_V2;
using Supabase;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

// ==========================================
// [박일용] Supabase 연결 설정 시작
// ==========================================

// 1. 여기에 복사해둔 URL을 넣으세요 (https://...co)
var url = "https://ypyogighzmdgzxpwlmof.supabase.co";

// 2. 여기에 복사해둔 Anon Key를 넣으세요 (eyJh...)
var key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlweW9naWdoem1kZ3p4cHdsbW9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MTIyODYsImV4cCI6MjA4MTQ4ODI4Nn0.yqMO2Ly_TVdBfMAsVn2d9VMJPofwqFPcKUTxKM1rcy0";

// 3. Supabase 클라이언트 등록 (옵션 설정)
var options = new Supabase.SupabaseOptions
{
    AutoRefreshToken = true,
    AutoConnectRealtime = false,
};

// 앱 전체에서 Supabase를 쓸 수 있게 등록합니다.
builder.Services.AddSingleton(provider => new Supabase.Client(url, key, options));

// ==========================================
// [박일용] 연결 설정 끝
// ==========================================

await builder.Build().RunAsync();