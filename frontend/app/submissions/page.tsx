import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const submissions = [
    {
        id: "1",
        student: "Ahmad Fulan",
        assignment: "Sejarah Kemerdekaan",
        submittedAt: "2025-12-16 10:00",
        status: "graded",
        score: 85,
    },
    {
        id: "2",
        student: "Budi Santoso",
        assignment: "Sejarah Kemerdekaan",
        submittedAt: "2025-12-16 10:15",
        status: "graded",
        score: 78,
    },
    {
        id: "3",
        student: "Citra Dewi",
        assignment: "Sejarah Kemerdekaan",
        submittedAt: "2025-12-16 10:30",
        status: "pending",
        score: null,
    },
]

export default function SubmissionsPage() {
    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Assignment</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell className="font-medium">{submission.student}</TableCell>
                                <TableCell>{submission.assignment}</TableCell>
                                <TableCell>{submission.submittedAt}</TableCell>
                                <TableCell>
                                    <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                                        {submission.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {submission.score !== null ? (
                                        <span className="font-bold">{submission.score}</span>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/submissions/${submission.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
