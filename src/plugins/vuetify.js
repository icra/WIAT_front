
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

//Icons
import icraLogo from '@/components/Logos/icraLogo'
import wbcsdLogo from '@/components/Logos/WBCSD-Logo_white-01'


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