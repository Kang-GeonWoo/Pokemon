import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Info } from "lucide-react"

interface InstructionCardProps {
    title: string
    steps: string[]
}

export function InstructionCard({ title, steps }: InstructionCardProps) {
    return (
        <Card className="bg-surface/30 border-primary/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Info className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg text-primary">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                    {steps.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
