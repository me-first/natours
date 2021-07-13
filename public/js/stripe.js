/*eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51JCJ5nSBUWEqSq6TfKBVUmp7Be2cMcPJsNRF83HkZBESaK93gmejTuaOabZxjAMNzAIfmZ5GHPF1GUjIRMpFaIGs00Avm6jF8c'
);

export const bookTour = async tourId => {
  try {
    //1) Get the session from the server
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', `Can't checkout now! Please try again later`);
  }
};
