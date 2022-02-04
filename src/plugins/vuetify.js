
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

//Icons
import icraLogo from '@/components/Logos/icraLogo'
import wbcsdLogo from '@/components/Logos/wbcsd'
import WasteWaterZero from '@/components/Logos/WasteWaterZero'



Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        values: {
            icra_logo: {
                component: icraLogo,
            },
            wbcsd_logo: {
                component: wbcsdLogo,
            },
            waste_water_zero_logo: {
                component: WasteWaterZero
            }
        },
    },
    theme: {
        themes: {
            light: {
                primary: '#1C195B',

            },
        },
    }
});