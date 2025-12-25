import Lottie from "lottie-react";

interface LottieIconProps {
    animationData: any;
    size?: number;
    className?: string;
    [key: string]: any;
}

const LottieIcon = ({ animationData, size = 24, className, ...props }: LottieIconProps) => {
    return (
        <div style={{ width: size, height: size }} className={`flex items-center justify-center ${className}`}>
            <Lottie
                animationData={animationData}
                loop={true}
                autoplay={true}
                {...props}
            />
        </div>
    );
};

export default LottieIcon;
