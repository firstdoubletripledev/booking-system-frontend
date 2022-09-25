import { useState, useEffect } from 'react';
import moment from 'moment';
import { head } from 'lodash';
import Const from '../const'
import ReservationTableService from '../services/reservationTable';

// ReservationTable の state と更新ロジックを持つフック
const useResavationTable = ({ start = new Date(), menu_id, staff_id }) => {
    const [reservationTable, setReservationTable] = useState([]);
    // このカスタムフックを利用しているコンポーネントがマウントされたら ReservationTable を取得する。
    useEffect(() => {
        const date = moment(start) //基準日
        const range = [...Array(Const.reservableRange).keys()]
        const fromTo = Const.fromTo
        const reservableRange = range.map(index => date.add(index && 1, 'days').format('YYYYMMDD'))
        const isExist = (response, day) => head(response.filter(data => data?.day === day))

        const fetchAll = async () => {
            const response = await ReservationTableService.getAll({ menu_id, staff_id });
            const calcTable = response;
            const data = fromTo.map(time => {
                const status =
                    reservableRange
                        .filter(day => isExist(calcTable, day))
                        .map(day => {
                            const target = isExist(calcTable, day).status
                            let { value } = head(target.filter(status => status.time === time))
                            // 1. 現在の2時間以降の予約のみネット予約可
                            // value = moment(day + time, "YYYYMMDDHHmm").isBefore(moment().add(2, 'hours')) ? '-' : value

                            // 2. 後続に選択したメニューの時間の空きコマがない場合は、予約不可
                            // const buffer = frame === 1 ? 0 : 1; // 60分メニュー以上の場合はバッファを積み増す
                            //  value = count - buffer < frame ? '-' : value // 2. 後続に選択したメニューの時間の空きコマがない場合は、予約不可
                            return value
                        })
                return { time, ...status }; // 時刻に対する横軸のデータを生成　例：1000 OK OK - - OK
            })
            setReservationTable(data)
        }
        fetchAll()

    }, [start, menu_id, staff_id]);
    return reservationTable;
};

export default useResavationTable