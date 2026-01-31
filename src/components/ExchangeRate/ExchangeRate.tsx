import styles from './ExchangeRate.module.css';
import {DollarSign} from 'lucide-react';
import {useWebSocket} from "../../API/useWebSocket";

const ExchangeRate: React.FC = () => {
    const {rate, isConnected, error} = useWebSocket();

    // Форматируем курс
    const formatRate = (value: number | null): string => {
        if (value === null) return '—';
        return value.toFixed(2);
    };

    // Определяем статус и текст
    const getStatusInfo = (): {text: string, className: string} => {
        if (isConnected) {
            return {text: 'CONNECTED', className: styles.statusConnected ?? ''};
        }
        if (error) {
            return {text: 'ERROR', className: styles.statusError ?? ''};
        }
        return {text: 'DISCONNECTED', className: styles.statusDisconnected ?? ''};
    };

    const statusInfo = getStatusInfo();

    return (
        <div className={styles.exchangeRateContainer}>
            <div className={styles.exchangeRateCard}>
                <div className={styles.exchangeRateHeader}>
                    <div className={styles.exchangeRateTitleWrapper}>
                        <DollarSign className={styles.exchangeRateIcon} size={16} />
                        <h3 className={styles.exchangeRateTitle}>USD Rate</h3>
                    </div>
                    <span className={`${styles.exchangeRateStatus} ${statusInfo.className}`}>
            {statusInfo.text}
          </span>
                </div>

                <div className={styles.exchangeRateValue}>
                    {formatRate(rate)}
                    <span className={styles.exchangeRateCurrency}>RUB</span>
                </div>
            </div>
        </div>
    );
};

export default ExchangeRate;