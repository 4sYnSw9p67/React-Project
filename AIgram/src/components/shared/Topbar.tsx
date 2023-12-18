import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { useSignOutAccount } from '@/lib/react-query/queriesAndMutations';
import { useEffect } from 'react';
import { useUserContext } from '@/context/AuthContext';

const Topbar = () => {
    const { mutate: signOut, isSuccess } = useSignOutAccount();
    const navigate = useNavigate();
    const { user } = useUserContext();

    useEffect(() => {
        if (isSuccess) {
            navigate("/sign-in");
        }
    }, [isSuccess]);

    return (
        <section className="topbar">
            <div className="flex-between py-4 px-5">
                <Link to="/" className="flex gap-3 items-center">

                    <img src="/assets/images/aigram-logo.png" alt="logo" className="rounded-xl" height={130} width={245} />

                </Link>

                <div className="flex gap-4">
                    <Button variant="ghost" className="shad-button_ghost" onClick={() => signOut()}>
                        <img src="/assets/icons/logout.svg" alt="logout" />
                    </Button>

                    <Link to={`/profile/${user.id}`} className="flex gap-3 items-center">
                        <img src={user.imageUrl || "/assets/images/profile-blank.png"} alt="profile" className="h-11 w-11 rounded-full" />
                    </Link>

                </div>

            </div>
        </section>
    )
}

export default Topbar
