import React, { useEffect, useState } from 'react'
import EditLocation from './editLocation'
import Geolocation from '@react-native-community/geolocation';
import Api from '/src/api'
import Utils from '/src/utils'
import Const from '/src/const'
import { useSelector } from 'react-redux'

let token
let idUser
let locationSelect
export default function EditLocationController(props) {
    const { navigation } = props
    const [dataLocation, setDataLocation] = useState([])
    const dataStore = useSelector(state => state.login)

    const onPressBack = () => {
        if (locationSelect !== undefined) {
            navigation.navigate(Const.NameScreens.MyProfile, { locationSelect })
        }
        else {
            navigation.goBack()
        }
    }

    const getDataStore = () => {
        if (dataStore.length > 0) {
            const { jwtToken, id } = dataStore[0]
            token = jwtToken
            idUser = id
        }
        else {
            return null // empty data
        }
    }

    useEffect(() => {
        getDataStore()
    }, [])

    useEffect(() => {
        let isMounted = true
        const getLocation = () => {
            Geolocation.getCurrentPosition(
                (position) => {
                    const currentLongitude =
                        JSON.stringify(position.coords.longitude);
                    const currentLatitude =
                        JSON.stringify(position.coords.latitude);

                    const params = {
                        latitude: currentLatitude,
                        longitude: currentLongitude
                    }
                    Api.RequestApi.getLocationDetailApiRequest(params)
                        .then(res => setDataLocation(res.data.data))
                        .catch(err => console.log(err))

                }, (error) => {
                    console.log(error.message)
                }, {
                enableHighAccuracy: false, timeout: 20000, maximumAge: 1000
            }
            );
        }
        if (isMounted) { getLocation() }
        return () => {
            isMounted = true
        }


    }, [])

    const onPressItemLocation = (item) => {
        const { label } = item
        locationSelect = label
        const params = {
            id: idUser,
            token,
            location: label
        }
        Api.RequestApi.putProfileLocationApiRequest(params)
            .then(res => {
                console.log('success')
                Utils.Toast.ToastModal('success', 'top', 'Success', 'You have saved your location successfully', 500)
            })
            .catch(err => {
                Utils.Toast.ToastModal('fail', 'top', 'Fail', `You have saved your location fail, error: ${err}`, 500)
                console.log(err)
            })

    }

    return (
        <EditLocation
            onPressBack={onPressBack}
            dataLocation={dataLocation}
            onPressItemLocation={onPressItemLocation}
        />
    )
}