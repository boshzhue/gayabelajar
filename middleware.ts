import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/", "/login", "/register"];

export async function middleware(req: NextRequest) {
    const token = req.cookies.get("access_token")?.value;

    const { pathname } = req.nextUrl;

    if (PUBLIC_PATHS.includes(pathname)) {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
        const decoded = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET) // cocokkan dengan SECRET_KEY FastAPI
        );

        const role = decoded.payload.role;
        if (pathname.startsWith("/student") && role !== "siswa") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        if (pathname.startsWith("/teacher") && role !== "guru") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }
        if (pathname.startsWith("/admin") && role !== "admin") {
            return NextResponse.redirect(new URL("/unauthorized", req.url));
        }

        return NextResponse.next();
    } catch (err) {
        console.error("Invalid token:", err);
        return NextResponse.redirect(new URL("/login", req.url));
    }
}

export const config = {
    matcher: ["/student/:path*", "/teacher/:path*", "/admin/:path*"],
};
