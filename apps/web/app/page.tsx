import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowRight, Swords, BarChart3, Users, Hammer } from 'lucide-react';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] py-12 space-y-20">

            {/* Hero Section */}
            <section className="text-center space-y-6 max-w-4xl animate-fade-in relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[100px] -z-10 animate-pulse-slow" />

                <div className="inline-block px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold mb-4 animate-slide-up backdrop-blur-sm">
                    9세대 싱글 배틀 완벽 지원 🚀
                </div>
                <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight leading-tight drop-shadow-lg">
                    메타를 지배하는 <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent-violet to-secondary filter drop-shadow">
                        AI 기반 포켓몬 어시스턴트
                    </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                    최강의 팀을 설계하고, 상대의 기술을 예측하며, 실시간 메타 데이터를 분석하세요.<br />
                    승리를 위한 모든 도구가 여기에 있습니다.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <Link href="/team-builder">
                        <Button size="lg" className="w-full sm:w-auto text-lg gap-2 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] transition-all transform hover:-translate-y-1">
                            나만의 팀 만들기 <ArrowRight className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href="/battle-assistant">
                        <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg gap-2 shadow-lg hover:shadow-pink-500/20 transition-all transform hover:-translate-y-1">
                            배틀 어시스턴트 시작
                        </Button>
                    </Link>
                </div>
            </section>

            {/* Features Grid */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full animate-slide-up container" style={{ animationDelay: '0.2s' }}>
                <FeatureCard
                    icon={<Hammer className="w-8 h-8 text-secondary" />}
                    title="팀 빌더"
                    description="Showdown 텍스트 가져오기/내보내기 지원. 버전 관리 시스템으로 나만의 파티를 완벽하게 최적화하세요."
                    href="/team-builder"
                />
                <FeatureCard
                    icon={<Swords className="w-8 h-8 text-primary" />}
                    title="배틀 어시스턴트"
                    description="실시간 사용률 통계 기반 기술 예측 알고리즘. 상대의 수를 미리 읽고 완벽한 턴을 설계하세요."
                    href="/battle-assistant"
                />
                <FeatureCard
                    icon={<BarChart3 className="w-8 h-8 text-accent-cyan" />}
                    title="메타 분석"
                    description="랭크 배틀 사용률, 기술 배치, 아이템 분포 등 심층 데이터를 한눈에 파악하세요."
                    href="/meta"
                />
                <FeatureCard
                    icon={<Users className="w-8 h-8 text-accent-emerald" />}
                    title="커뮤니티"
                    description="고수들의 렌탈 팀을 공유받고, 샘플을 연구하며 함께 성장하는 공간입니다."
                    href="/community"
                />
            </section>
        </div>
    );
}

function FeatureCard({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
    return (
        <Link href={href} className="group">
            <Card className="h-full border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/20 bg-surface/40 backdrop-blur-md overflow-hidden relative">
                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <CardHeader>
                    <div className="p-3 bg-white/5 w-fit rounded-xl mb-4 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        {icon}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-400 leading-relaxed text-sm font-light group-hover:text-gray-200 transition-colors">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </Link>
    );
}
