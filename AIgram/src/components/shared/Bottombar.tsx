import { Link, useLocation } from "react-router-dom";

import { bottombarLinks } from "@/constants";
import { xNavLink } from "@/types";

const Bottombar = () => {
    const { pathname } = useLocation();

    return (
        <section className="bottom-bar">
            {bottombarLinks.map((link: xNavLink) => {
                const isActive = pathname === link.route;
                return (
                    <Link
                        key={`bottombar-${link.label}`}
                        to={link.route}
                        className={`${isActive && "rounded-[10px] bg-primary-500 "
                            } flex-center flex-col gap-1 p-2 transition`}>
                        <img
                            src={link.imgURL}
                            alt={link.label}
                            width={24}
                            height={24}
                            className={`${isActive && "invert-white"}`}
                        />

                        <p className="medium-regular text-light-2">{link.label}</p>
                    </Link>
                );
            })}
        </section>
    );
};

export default Bottombar;