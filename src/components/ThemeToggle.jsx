import { useState,useEffect } from "react";
function ThemeToggle(){
    const[theme,setTheme] = useState(()=> {return localStorage.getItem("theme") || "light";});

    useEffect(()=>{
        document.documentElement.setAttribute("data-theme",theme);
        localStorage.setItem("theme",theme);
    },[theme]);

    function toggleTheme(){
        setTheme((prev) => (prev === "light"?"dark":"light"));
    }
    return(
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
            {theme === "light" ? "🌙" : "☀️"}
        </button>
    );
}
export default ThemeToggle;