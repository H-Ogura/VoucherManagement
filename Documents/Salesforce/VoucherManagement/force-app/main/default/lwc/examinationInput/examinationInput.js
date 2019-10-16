import { LightningElement, track, api } from 'lwc';
import getVoucherList from '@salesforce/apex/ExaminationInputController.getVoucherList';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
import ID_FIELD from '@salesforce/schema/ExaminationInfo__c.Id';
import EXAM_FIELD from '@salesforce/schema/ExaminationInfo__c.Exam__c';
import WILLEXAM_FIELD from '@salesforce/schema/ExaminationInfo__c.WillExam__c';
import PASSORFAIL_FIELD from '@salesforce/schema/ExaminationInfo__c.PassOrFail__c';

const actions = [
    { label: '編集', name: 'edit', iconName : 'utility:edit' }
];

const columns = [
    {label : '決裁番号', fieldName : 'FinalDecisionNumber__c'},
    {label : '決裁日', fieldName : 'FinalDecisionDate__c', type : 'date-local'},
    {label : 'バウチャー番号', fieldName : 'VoucherNumber__c'},
    {label : '対象者', fieldName : 'AssignUser__c'},
    {label : '利用期日', fieldName : 'LimitDate__c', type : 'date-local'},
    {label : '試験', fieldName : 'Exam__c'},
    {label : '予定日', fieldName : 'WillExam__c', type : 'date-local'},
    {label : '合否', fieldName : 'PassOrFail__c'},
    {type : 'action',
     typeAttributes : { rowActions : actions }
    }
];
export default class ExaminationInput extends LightningElement {
    @track voucher;
    @track columns = columns;
    @track rowOffset = 0;
    @track editmode = false;
    @track examid;
    @track exam;
    @track examdate;
    @track pof;

    async connectedCallback() {
        this.voucher = await getVoucherList();
    }

    handleRowAction(e){
        const row = e.detail.row;
        this.examid = row.Id;
        this.exam = row.Exam__c;
        this.examdate = row.WillExam__c;
        this.pof = row.PassOrFail__c;
        this.editmode = true;
    }

    handleSuccess(e){
        this.editmode = false;
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: '更新しました！',
                variant: 'success'
            })
        );
    }

    saveRecord(){
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.examid;
        fields[EXAM_FIELD.fieldApiName] = this.exam;
        fields[WILLEXAM_FIELD.fieldApiName] = this.examdate;
        fields[PASSORFAIL_FIELD.fieldApiName] = this.pof;
        
        const recordInput = { fields };
        console.log(fields);
        updateRecord(recordInput)
            .then(() => {
                this.editmode = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: '更新しました！',
                        variant: 'success'
                    })
                );
                // Display fresh data in the form
                //return refreshApex(this.examid);
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: JSON.stringify(error.message.body),
                        variant: 'error'
                    })
                );
            });
    }

    closeModal(){
        this.editmode = false;
    }
}