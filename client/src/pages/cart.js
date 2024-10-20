import React, { useEffect, useState } from 'react';
import './cart.css';
import { useSelector, useDispatch } from 'react-redux'; 
import { clearCart, removeItem, setCartItems } from '../slices/slice'; 
import { useNavigate } from 'react-router-dom'; 
import { selectUser } from '../slices/authSlice'; 
import axios from 'axios';

const Cart = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectUser);
    const cart = useSelector(state => state.cart); // Get cart from Redux state
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Fetch cart items from the server and store them in Redux
        const fetchCartItems = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/cart');
                dispatch(setCartItems(response.data));
                console.log(response.data) // Update Redux state with fetched cart items
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setErrorMessage('Failed to fetch cart items.');
            }
        };

        fetchCartItems();
    }, [dispatch]);

    const calculateTotalPrice = () => {
        return Object.values(cart).reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0).toFixed(2);
    };

    const handleCheckout = () => {
        navigate(user ? '/payment' : '/login');
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await axios.delete(`http://localhost:5000/api/cart/${itemId}`);
            dispatch(removeItem(itemId)); // Update Redux state
            setSuccessMessage('Item removed successfully.');
        } catch (error) {
            console.error('Error removing item from cart:', error);
            setErrorMessage('Failed to remove item from cart.');
        }
    };

    const handleClearCart = async () => {
        try {
            await axios.delete('http://localhost:5000/api/cart/clear');
            dispatch(clearCart()); // Clear cart in Redux
            setSuccessMessage('Cart cleared successfully.');
        } catch (error) {
            console.error('Error clearing the cart:', error);
            setErrorMessage('Failed to clear the cart.');
        }
    };

    return (
        <div className="cart-container">
            <h1>Your Cart</h1>
            {errorMessage && <p className="error">{errorMessage}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            {Object.keys(cart).length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    <div className="cart-items">
                        {Object.values(cart).map(item => (
                            <div className="cart-item" key={item.id}>
                                <img 
                                    src={`http://localhost:5000/images/${item.image}`} alt={item.name}  
                                    onError={(e) => { e.target.src = '/placeholder.jpg'; }} 
                                    className="cart-item-image" 
                                />
                                <div className="cart-item-details">
                                    <h3>{item.name}</h3>
                                    <p>Price: ${(item.price || 0).toFixed(2)}</p>
                                    <p>Quantity: {item.quantity}</p>
                                    <p>Total: ${(item.price * item.quantity || 0).toFixed(2)}</p>
                                    <button onClick={() => handleRemoveItem(item.id)}>Remove</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <h2>Total Price: ${calculateTotalPrice()}</h2>
                        <button className="clear-cart" onClick={handleClearCart}>Clear Cart</button>
                        <button className="checkout-button" onClick={handleCheckout}>Checkout</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
