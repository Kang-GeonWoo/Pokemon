import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Search, Shield, Target, Users } from "lucide-react";

export default function GuidePage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="p-3 bg-primary/10 rounded-full">
                    <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    PokeAssist 이용 가이드
                </h1>
                <p className="text-lg text-gray-400 max-w-2xl">
                    포켓몬 쇼다운에서 승리하기 위한 최고의 파트너. 각 핵심 메뉴의 기능을 살펴보고 활용해 보세요.
                </p>
            </div>

            <div className="grid gap-6">
                <Card className="bg-glass border-white/5 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">1. 팀 빌더 (Team Builder)</CardTitle>
                            <CardDescription>나만의 최강 6마리 팀을 설계하고 관리하세요.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p className="leading-relaxed">
                            <strong>사용 방법:</strong> '비어있음' 슬롯을 클릭하여 원하는 포켓몬을 검색하여 등록합니다. 첫 번째 특성과 사용할 수 있는 모든 기술 목록이 자동으로 로드됩니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li>팀은 브라우저에 임시 저장되거나 <strong>팀 저장 시스템</strong>을 통해 로그인된 계정에 동기화됩니다.</li>
                            <li>타겟하는 세대나 룰(Gen 9 OU 등)에 맞는 기술폭인지 확인하는 용도로 적합합니다.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-glass border-white/5 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                        <div className="p-2 bg-accent-blue/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Target className="w-6 h-6 text-accent-blue" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">2. 배틀 허브 (Battle Assistant)</CardTitle>
                            <CardDescription>실전 배틀 중 상대방의 움직임을 확률 기반으로 예측합니다.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p className="leading-relaxed">
                            <strong>사용 방법:</strong> 실제 매칭이 잡혔을 때, 상대방 엔트리에 보이는 6마리 포켓몬의 이름을 입력하고 <strong>[엔트리 저장 및 분석 연산]</strong> 버튼을 누르세요.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li><strong>기술 예측:</strong> AI가 통계에 기반하여 이 포켓몬이 가장 들고 올 확률이 높은 기술 4가지를 퍼센트로 보여줍니다.</li>
                            <li><strong>확정 (Lock) 버튼:</strong> 실제 전투 중 상대가 해당 기술을 사용하는 것을 눈으로 확인했다면 <strong>자물쇠 아이콘</strong>을 클릭하세요. 즉시 확률이 재계산되고 100% 확정으로 고정됩니다.</li>
                            <li><strong>배제 (Ban) 버튼:</strong> 상대가 해당 기술을 쓸 리가 없거나(예: 다른 아이템 확정 시) 제외하고 싶다면 <strong>금지 기호</strong>를 눌러 확률표에서 지워버릴 수 있습니다.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-glass border-white/5 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                        <div className="p-2 bg-accent-violet/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Search className="w-6 h-6 text-accent-violet" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">3. 메타 분석 (Meta Analysis)</CardTitle>
                            <CardDescription>전 세계 랭커들의 통계 데이터를 한눈에 확인하세요.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p className="leading-relaxed">
                            <strong>사용 방법:</strong> 현재 배틀 티어에서 가장 많이 쓰이는 포켓몬 사용률(Usage)을 확인하고 메타의 흐름을 읽을 수 있습니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li>오리지널 Smogon 통계를 분석 파이프라인(n8n 등)이 긁어와 가장 읽기 쉬운 형태로 요약해 드립니다.</li>
                            <li>대부분의 상대가 구애스카프를 쓰는지, 기합의띠를 쓰는지 통계적 경향성을 보여줍니다.</li>
                        </ul>
                    </CardContent>
                </Card>

                <Card className="bg-glass border-white/5 overflow-hidden group">
                    <CardHeader className="flex flex-row items-center gap-4 pb-4">
                        <div className="p-2 bg-secondary/10 rounded-lg group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">4. 회원가입 및 커뮤니티</CardTitle>
                            <CardDescription>나의 설정 값과 팀을 안전하게 보관하세요.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 text-gray-300">
                        <p className="leading-relaxed">
                            <strong>가입 혜택:</strong> 우측 상단의 <strong>[시작하기]</strong> 혹은 로그인 메뉴를 통해 간단한 계정을 생성할 수 있습니다.
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-sm">
                            <li>회원가입 시 입력된 이메일과 비밀번호는 클라우드 데이터베이스(Supabase)에 암호화되어 안전하게 보관됩니다.</li>
                            <li>내가 만든 파티를 <strong>커뮤니티</strong> 게시판에 올려 다른 유저들에게 렌탈 팀 코드로 자랑할 수 있습니다.</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-8 p-6 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-white/10 text-center">
                <h3 className="text-lg font-semibold text-white mb-2">도움이 더 필요하신가요?</h3>
                <p className="text-sm text-gray-400">
                    서비스 관련 문의나 버그 제보는 관리자에게 언제든 알려주세요. 계속해서 데이터가 갱신됩니다!
                </p>
            </div>
        </div>
    );
}
