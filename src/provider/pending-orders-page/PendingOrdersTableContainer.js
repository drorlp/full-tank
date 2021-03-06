import {getPendingOrders} from '../../store/orders/Selectors';
import _ from 'lodash';
import {selectOrder, sendSelectedOrderToDatabase, updateSelectedOrder} from '../../store/selected-order/Actions';
import PendingOrdersTable from './PendingOrdersTable';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {getCarById} from '../../store/cars/Selectors';
import {selectCar} from '../../store/selected-car/Actions';

function mapStateToProps(state, ownProps) {
    if (!ownProps.coords)
        return {};

    const orders = getPendingOrders(state);
    const rows = _.map(orders, order => {
        const distance = calcCrow(ownProps.coords.latitude, ownProps.coords.longitude, order.latitude, order.longitude);
        const distanceString = distance.toString().substr(0, 6) + ' KM';
        return {
            id: order.id,
            createdTime: order.createdTime,
            distance: distanceString,
            sorter: distance,
            carNumber: order.carNumber,
            driverPhone: getCarById(state, order.carNumber).driverPhone,
        };
    });


    return {
        rows: _.orderBy(rows, x => x.sorter)
    }
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        onClick: async (orderId, carNumber) => {
            dispatch(selectOrder(orderId));
            dispatch(selectCar(carNumber));
            ownProps.history.push('/order-handling');

            await dispatch(updateSelectedOrder('onTheWayTime', new Date().toLocaleString()));
            dispatch(sendSelectedOrderToDatabase());
        }
    }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PendingOrdersTable));


//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    lat1 = toRad(lat1);
    lat2 = toRad(lat2);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.ceil(d * 100) / 100;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}