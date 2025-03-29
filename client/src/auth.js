import { useState, useEffect } from 'react';
import { auth } from './firebase';

export default function user_auth() {

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
      setAuthLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, authLoading, isLoggedIn: !!user };

}