import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl mb-4">Вход</h2>
            <LoginForm/>
        </div>
    );
}