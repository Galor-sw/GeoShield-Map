import {useJsApiLoader, GoogleMap} from '@react-google-maps/api'


const GoogleMapFunction = () => {
    const center = { lat: 48.8584, lng: 2.2945 };
    const API_KEY = "AIzaSyDdKQY_n89HWZDY7032fvrra6JrECnFAjU";
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: API_KEY,
    })
    return (
        <GoogleMap center={center} zoom={15} mapContainerStyle={{width: "100%", height: "100%"}}>
            
        </GoogleMap>
    )
}

export default GoogleMapFunction; 