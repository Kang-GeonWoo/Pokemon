/** @type {import('next').NextConfig} */
const nextConfig = {
    // SWC Minifier(C++ 컴파일러)가 V8 메모리와 충돌하며 3221226505(Access Violation) 에러를 일으키는 현상을 방지
    swcMinify: false,

    // Lucide-React 등 대용량 아이콘/유틸 패키지 로딩 중 발생하는 메모리 과부하 보호
    transpilePackages: ['lucide-react'],

    experimental: {
        // 렌더링 최적화를 위해 Turbotrace 및 모듈 병렬 처리를 제한 (OOM 방지)
        workerThreads: false,
        cpus: 1
    }
}

module.exports = nextConfig
