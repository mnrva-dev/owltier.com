import LoginForm from '../Components/LoginForm'
import Nav from '../Components/Nav'

export default function Login() {
    return (
        <div className="page-content no-w">
        <div className="left-menus">
        </div>
        <LoginForm />
        <Nav current='login'/>
        </div>
    )
}