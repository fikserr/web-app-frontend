import React from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import App from '../App';
import Home from '../pages/home'
import Shop from '../pages/shop'
import Basket from '../pages/basket'
import Report from '../pages/report'
import Categories from '../pages/categories'
import Detail from '../pages/detail'
import Formalize from '../pages/formalize'
import OrdersPage from '../pages/orderList';

const Router = () => {
    const router = createBrowserRouter(
        createRoutesFromElements(
            <Route path="/" element={<App />}>
                <Route index element={<Categories/>} />
                <Route path='/shop' element={<Shop/>}/>
                <Route path='/basket' element={<Basket/>}/>
                <Route path='/report' element={<Report/>}/>
                <Route path='/home' element={<Home />}/>
                <Route path='/detail' element={<Detail/>}/>
                <Route path='/formalize' element={<Formalize/>}/>
                <Route path='/orderList' element={<OrdersPage/>}/>
            </Route>
        )
    );
    return <RouterProvider router={router} />;
};

export default Router;
