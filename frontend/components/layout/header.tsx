import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
    return (
        <div className="border-b">
            <div className="flex h-16 items-center px-4">
                <div className="ml-auto flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Dr. Dosen Senior</span>
                        <Avatar>
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>DS</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>
        </div>
    )
}
