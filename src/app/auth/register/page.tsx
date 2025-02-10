import AuthForm from "@/components/RegisterForm";


export default function RegisterPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 className="text-2xl mb-4">📝 Регистрация</h2>
            <AuthForm type="register"/>;
        </div>
    );
}