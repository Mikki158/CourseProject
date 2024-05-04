import AuthProvider from './provider/authProvider';
import Routes from './routes';

function App() {

  const [currentForm, setCurrentForm] = useState('login');

  const toggleForm = (formName) => {
    setCurrentForm(formName);
  }

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  )
}

export default App;
