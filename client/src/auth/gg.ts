export const googleLogin = () => {
    const params = new URLSearchParams({
        client_id: "169367165282-ahfms6g5abp1qgc0fmqeqq98pctbituq.apps.googleusercontent.com",
        redirect_uri: "http://localhost:5173/auth/callback",
        response_type: "code",
        access_type: "offline",
        prompt: "consent",
        scope: ["openid", "email", "profile", "https://www.googleapis.com/auth/user.birthday.read", "https://www.googleapis.com/auth/user.gender.read"].join(" "),
    });

    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    console.log("URL:", url);
    window.location.href = url;
};
