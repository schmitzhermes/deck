import {module} from 'angular';
import {IModalService, IModalServiceInstance} from 'angular-ui-bootstrap';
import {cloneDeep} from 'lodash';

import {LoadBalancerReader} from 'core/loadBalancer/loadBalancer.read.service';
import {CloudProviderRegistry} from 'core/cloudProvider/cloudProvider.registry';
import {Application} from 'core/application/application.model';
import {ILoadBalancer} from 'core/domain/loadBalancer';

class AppengineLoadBalancerChoiceModalCtrl {
  public state = {loading: true};
  public loadBalancers: ILoadBalancer[];
  public selectedLoadBalancer: ILoadBalancer;

  static get $inject() { return ['$uibModal', '$uibModalInstance', 'application', 'loadBalancerReader', 'cloudProviderRegistry']; }

  constructor(private $uibModal: IModalService,
              private $uibModalInstance: IModalServiceInstance,
              private application: Application,
              private loadBalancerReader: LoadBalancerReader,
              private cloudProviderRegistry: CloudProviderRegistry) {
    this.initialize();
  }

  public submit(): void {
    let config = this.cloudProviderRegistry.getValue('appengine', 'loadBalancer');
    let updatedLoadBalancerPromise = this.$uibModal.open({
      templateUrl: config.createLoadBalancerTemplateUrl,
      controller: `${config.createLoadBalancerController} as ctrl`,
      size: 'lg',
      resolve: {
        application: () => this.application,
        loadBalancer: () => cloneDeep(this.selectedLoadBalancer),
        isNew: () => false,
        forPipelineConfig: () => true,
      }
    }).result;

    this.$uibModalInstance.close(updatedLoadBalancerPromise);
  }

  public cancel(): void {
    this.$uibModalInstance.dismiss();
  }

  private initialize(): void {
    this.application.getDataSource('loadBalancers').ready()
      .then(() => {
        this.loadBalancers = this.application.getDataSource('loadBalancers')
          .data.filter((candidate) => candidate.cloudProvider === 'appengine');

        if (this.loadBalancers.length) {
          this.selectedLoadBalancer = this.loadBalancers[0];
        }
        this.state.loading = false;
      });
  }
}

export const APPENGINE_LOAD_BALANCER_CHOICE_MODAL_CTRL = 'spinnaker.appengine.loadBalancerChoiceModal.controller';
module(APPENGINE_LOAD_BALANCER_CHOICE_MODAL_CTRL, [])
  .controller('appengineLoadBalancerChoiceModelCtrl', AppengineLoadBalancerChoiceModalCtrl);