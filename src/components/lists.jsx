import { IoIosCart } from "react-icons/io";
import Phones from '../assets/phones.png';
import Laptops from '../assets/laptops.png';
import Cameras from '../assets/camera.png';
import Appliances from '../assets/appliances.png';
import IPhone from '../assets/iphone.png';
import TV from '../assets/TV.png';
import Gadgets from '../assets/gadgets.png';


export const initialCategories = [
    {
        title: "Telefonlar",
        image: Phones,
        active: true,
    },
    {
        title: "Kompyuter va laptop",
        image: Laptops,
        active: false,
    },
    {
        title: "Kameralar",
        image: Cameras,
        active: false,
    },
    {
        title: "Maishiy texnikalar",
        image: Appliances,
        active: false,
    },
];
export const allCategory = [
    {
        title: "Telefonlar",
        image: Phones,
        active: true,
    },
    {
        title: "Kompyuter va laptop",
        image: Laptops,
        active: false,
    },
    {
        title: "Kameralar",
        image: Cameras,
        active: false,
    },
    {
        title: "Maishiy texnikalar",
        image: Appliances,
        active: false,
    },
    {
        title: "Televizorlar",
        image: TV,
        active: false,
    },
    {
        title: "Gadjetlar",
        image: Gadgets,
        active: false,
    },
];

export const products = [
    {
        id: 1,
        title: "iPhone 14 Pro Max",
        price: 1099,
        image: IPhone,
        basket: <IoIosCart />,
    },
    {
        id: 2,
        title: "iPhone 14 Pro Max",
        price: 1099,
        image: IPhone,
        basket: <IoIosCart />,
    },
    {
        id: 3,
        title: "iPhone 14 Pro Max",
        price: 1099,
        image: IPhone,
        basket: <IoIosCart />,
    },
    {
        id: 4,
        title: "iPhone 14 Pro Max",
        price: 1099,
        image: IPhone,
        basket: <IoIosCart />,
    },
]