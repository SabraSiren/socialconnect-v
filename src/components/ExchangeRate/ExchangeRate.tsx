import styles from './ExchangeRate.module.scss';
import { DollarSign } from 'lucide-react';
import { useWebSocketContext } from "../../API/WebSocketContext";

interface ExchangeRateProps {
    embedded?: boolean;
}

const ExchangeRate: React.FC<ExchangeRateProps> = ({ embedded }) => {
    const { rate, isConnected, error } = useWebSocketContext();

    // Форматируем курс
    const formatRate = (value: number | null): string => {
        if (value === null) return '—';
        return value.toFixed(2);
    };

    // Определяем статус и текст
    const getStatusInfo = (): {text: string, className: string} => {
        if (isConnected) {
            return {text: 'CONNECTED', className: styles['exchangeRate__status--connected'] ?? ''};
        }
        if (error) {
            return {text: 'ERROR', className: styles['exchangeRate__status--error'] ?? ''};
        }
        return {text: 'DISCONNECTED', className: styles['exchangeRate__status--disconnected'] ?? ''};
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={`${styles.exchangeRate__container} ${embedded ? styles.exchangeRate__containerEmbedded : ""}`}>
            <div className={styles.exchangeRate__card}>
                <div className={styles.exchangeRate__header}>
                    <div className={styles.exchangeRate__titleWrapper}>
                        <DollarSign className={styles.exchangeRate__icon} size={16} />
                        <h3 className={styles.exchangeRate__title}>USD Rate</h3>
                    </div>
                    <span className={`${styles.exchangeRate__status} ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
                </div>

                <div className={styles.exchangeRate__value}>
                    {formatRate(rate)}
                    <span className={styles.exchangeRate__currency}>RUB</span>
                </div>
            </div>
        </div>
    );
};

export default ExchangeRate;