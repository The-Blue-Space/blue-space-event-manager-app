import AuthContainer from "@/components/app/container/auth-container";
import Form from "./form";
import Link from "next/link";

export default function Login() {
	return (
		<AuthContainer auth_link="register">
			{/* Logo/Brand */}

			{/* Sign In Card */}
			<div className="bg-white rounded-lg shadow border border-neutral-200 p-8 w-full">
				<div className="mb-6">
					<h2 className="heading-5 text-primary-500 mb-">Welcome back</h2>
					<p className="body-2 text-neutral-600">Sign in to manage your events</p>
				</div>

				<Form />
			</div>

			{/* Note */}
			<div className="mt-3 text-center">
				<p className="body-3 text-gray-500">
					Need access?{" "}
					<Link
						href="#"
						className="text-primary-300 hover:text-primary-1000 font-medium transition-colors"
					>
						Contact your administrator
					</Link>
				</p>
			</div>
		</AuthContainer>
	);
}

// <form onSubmit={handleSubmit} className="space-y-5">
// 	{/* Email Field */}
// 	<div>
// 		<label htmlFor="email" className="block body-2 font-semibold text-gray-700 mb-2">
// 			Email or Username
// 		</label>
// 		<input
// 			id="email"
// 			type="text"
// 			required
// 			value={formData.email}
// 			onChange={(e) => setFormData({ ...formData, email: e.target.value })}
// 			className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg body-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
// 			placeholder="you@example.com"
// 		/>
// 	</div>

// 	{/* Password Field */}
// 	<div>
// 		<label htmlFor="password" className="block body-2 font-semibold text-gray-700 mb-2">
// 			Password
// 		</label>
// 		<input
// 			id="password"
// 			type="password"
// 			required
// 			value={formData.password}
// 			onChange={(e) => setFormData({ ...formData, password: e.target.value })}
// 			className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg body-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all"
// 			placeholder="••••••••"
// 		/>
// 	</div>

// 	{/* Forgot Password Link */}
// 	<div className="flex justify-end">
// 		<Link href="#" className="body-2 text-primary-300 hover:text-primary-1000 transition-colors">
// 			Forgot password?
// 		</Link>
// 	</div>

// 	{/* Submit Button */}
// 	<button
// 		type="submit"
// 		disabled={isLoading}
// 		className="w-full bg-primary-1000 hover:bg-primary-300 text-white py-3 rounded-lg body-1 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
// 	>
// 		{isLoading ? "Signing in..." : "Sign in"}
// 	</button>
// </form>;
