
import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

//Icons
import icraLogo from '@/components/Logos/icraLogo'


Vue.use(Vuetify);

export default new Vuetify({
    icons: {
        values: {
            icra_logo: {
                component: icraLogo, // you can use string here if component is registered globally

            },
        },
    },
});