import React, { useState, useEffect } from 'react';
import { UpOutlined } from '@ant-design/icons';
import './ScrollToTop.css';

const ScrollToTop = () => {
    const [visible, setVisible] = useState(false);

    // Показывать кнопку только когда пользователь прокрутил вниз
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.pageYOffset > 300) {
                setVisible(true);
            } else {
                setVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);

        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    // Плавная прокрутка наверх при клике
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <>
            {visible && (
                <div
                    className="scroll-to-top-button"
                    onClick={scrollToTop}
                    aria-label="Прокрутить наверх"
                >
                    <UpOutlined />
                </div>
            )}
        </>
    );
};

export default ScrollToTop;