import classes from './LogoutForm.module.css';
import { useAuth } from '../../contexts/AuthContext';

export const LogoutForm = () => {
  const { logoutUser, setLoggedIn } = useAuth();

  const handleLogout = () => {
    logoutUser();
    setLoggedIn(false);
  };

  return (
    <div className={classes.container}>
      <p className={classes.greeting}>Thank you for visiting!</p>
      <p className={classes.message}>
        You're currently logged in. Feel free to browse products, check your library, or explore the blog.
      </p>
      <button className={classes.logoutButton} onClick={handleLogout}>
        Log out
      </button>
    </div>
  );
};
