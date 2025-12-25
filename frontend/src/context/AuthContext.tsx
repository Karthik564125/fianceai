import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut, deleteUser } from "firebase/auth";
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from "firebase/firestore";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        setUser({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userDoc.data()
                        });
                    } else {
                        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
                    }
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                    setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const deleteAccount = async () => {
        if (!auth.currentUser) return;

        const uid = auth.currentUser.uid;
        const batch = writeBatch(db);

        try {
            // Delete user data from Firestore
            const collections = ["expenses", "incomes", "upcoming"];
            for (const col of collections) {
                const q = query(collection(db, col), where("userId", "==", uid));
                const snapshot = await getDocs(q);
                snapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });
            }

            // Delete user profile
            batch.delete(doc(db, "users", uid));

            // Commit firestore deletions
            await batch.commit();

            // Finally delete the user from Firebase Auth
            await deleteUser(auth.currentUser);
            setUser(null);
        } catch (error) {
            console.error("Account deletion failed:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, logout, deleteAccount, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
