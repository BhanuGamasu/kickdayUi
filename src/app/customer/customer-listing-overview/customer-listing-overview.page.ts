import { Swiper } from 'swiper';
import { Router } from '@angular/router';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

import { AdminService } from 'src/app/services/admin.service';
@Component({
  selector: 'app-customer-listing-overview',
  templateUrl: './customer-listing-overview.page.html',
  styleUrls: ['./customer-listing-overview.page.scss'],
})
export class CustomerListingOverviewPage {

  @ViewChild('swiper')
  swiperRef: ElementRef | undefined;
  swiper?: Swiper;
  _id: any = '';
  listingData: any = {};
  totalCost: number = 0;
  selectedDeliveryType: any;
  note: any = '';
  swiperHeight: string = '240px';


  constructor(
    private router: Router,
    private model: ModalController,
    private alert: AlertController,
    private adminService: AdminService,
  ) {
    this.selectedDeliveryType = null;
  }

  ngOnInIt() {
  }

  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }

  ionViewWillEnter() {
    this._id = this.router.url.split('/')[2];
    this.listingData = {};
    this.totalCost = 0;
    this.selectedDeliveryType = '';
    this.note = '';
    this.adminService.getListingForUser({ _id: this._id }).subscribe((res: any) => {
      if (res.success && res.data) {
        this.listingData = res.data || {};
        this.swiperHeight = '241px';
        this.listingData.listingOrders.forEach((order: any) => {
          order.count = order.quantity !== undefined ? 0 : order.quantity;
          order.individualItemCost = order.price * order.count || 0;
        });
        this.calculateTotalCost();
      } else this.navigateToListings();
    }, (err) => {
      this.navigateToListings();
    })
  }


  selectDeliveryType(type: any) {
    this.selectedDeliveryType = type;
  }



  swiperSlideChanged(e: any) {
    console.log('changed: ', e);
  }


  favItem() {
    this.adminService.setFavItem({ _id: this._id }).subscribe((res: any) => {
      if (res.success) {
        this.listingData.favourite = true;
      }
    }, (err: any) => {
      console.log(err);
    })
  }

  unFavItem() {
    this.adminService.setUnFavItem({ _id: this._id }).subscribe((res: any) => {
      if (res.success) {
        this.listingData.favourite = false;
      }
    }, (err: any) => {
      console.log(err);
    })
  }

  incrementCount(order: any) {
    if (order && 'count' in order && 'quantity' in order) {
      if (order.count < order.quantity) {
        order.count = (order.count || 0) + 1;
        order.individualItemCost = order.price * order.count || 0;
        this.calculateTotalCost();
      }
    } else {
      console.warn('Order object or its properties are undefined or missing.');
    }
  }

  decrementCount(order: any) {
    if (order.count && order.count > 0) {
      order.count--;
      order.individualItemCost = order.price * order.count || 0;
      this.calculateTotalCost();
    }
  }

  calculateTotalCost() {
    this.totalCost = this.listingData.listingOrders.reduce((sum: number, order: any) => {
      return sum + order.individualItemCost || 0;
    }, 0);
  }

  addToCart() {
    let orderedItems = this.listingData.listingOrders.filter((e: any) => e.count);
    let deliveryOption = this.listingData.deliveryOptions.find((e: any) => e.type == this.selectedDeliveryType);
    let obj = {
      refListingId: this.listingData._id,
      refMakerId: this.listingData.refMakerId,
      deliveryOption: deliveryOption,
      note: this.note,
      finalCostWithOutDeliveryOption: this.totalCost,
      orderedItems: orderedItems
    }
    if (this.totalCost && this.selectedDeliveryType) {
      this.adminService.addToCart(obj).subscribe((res: any) => {
        if (res.success && res._id) {
          this.router.navigateByUrl('/orderSummary/' + res._id);
        }
        else this.openAlert('ERROR', 'something went wrong please try again later', ['close']);
      }, (err) => {
        this.openAlert('ERROR', 'something went wrong please try again later', ['close']);
      })
    } else {
      console.log("Please select")
    }
  }

  navigateToListings() {
    this.router.navigate(['/customerListings']);
  }

  async openAlert(header: any, message: any, buttons: any) {
    const alert = await this.alert.create({
      header: header,
      message: message,
      buttons: buttons,
      mode: 'ios',
    });

    await alert.present();
  }

  async goBack() {
    let orderedItems = this.listingData?.listingOrders?.filter((e: any) => e.count);
    console.log(orderedItems);
    if (orderedItems.length) {
      const confirmed = await this.adminService.presentDeleteConfirmation('Confirm', 'Sure you want to cancel the order?', '');
      console.log({ confirmed });
      if (confirmed)  this.router.navigate(['/customerListings']);
    } else {
      this.router.navigate(['/customerListings']);
    }
  }
}
