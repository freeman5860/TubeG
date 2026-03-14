import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <FileQuestion className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-2">页面未找到</h1>
      <p className="text-muted-foreground mb-6">
        你访问的页面不存在或已被移除
      </p>
      <Link href="/">
        <Button>返回首页</Button>
      </Link>
    </div>
  );
}
