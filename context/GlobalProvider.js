import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../lib/appwrite";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({children}) => {

    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [userGoal, setUserGoal] = useState(null);
    const [refreshGoals, setRefreshGoals] = useState(false);
    const [refreshLogs, setRefreshLogs] = useState(false);

    


    useEffect(() => {
        getCurrentUser()
            .then((res) => {
                if(res) {
                   setIsLoggedIn(true);
                   setUser(res)
                } else {
                    setIsLoggedIn(false);
                    setUser(null)
                }
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                setIsLoading(false)
            });
    }, []);

    return (
        <GlobalContext.Provider
           value={{
                isLoggedIn,
                setIsLoggedIn,
                user,
                setUser,
                isLoading,
                currentMonth,
                setCurrentMonth,
                userGoal,
                setUserGoal,
                refreshGoals,
                setRefreshGoals,
                refreshLogs,
                setRefreshLogs

           }} 
        >
        {children}
        </GlobalContext.Provider>
    );
};

export default GlobalProvider;
