export const googleLogin = () => {
    const params = new URLSearchParams({
        client_id: "169367165282-ahfms6g5abp1qgc0fmqeqq98pctbituq.apps.googleusercontent.com",
        redirect_uri: "http://localhost:5173/auth/callback", // FE callback
        response_type: "code",
        scope: [
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            // nếu muốn bỏ birthday thì bỏ luôn dòng dưới:
            "https://www.googleapis.com/auth/user.birthday.read",
        ].join(" "),
        access_type: "offline",
        prompt: "consent",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};
