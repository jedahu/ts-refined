import {Refinement} from "./index";

export class NotEmpty implements Refinement<string> {
    "@nominal" : "9f3f7599-067a-432c-995e-58ba041cad68";
    test = (s : string) => s !== "";
}

export class NotBlank implements Refinement<string> {
    "@nominal" : "e48188e1-0398-4fcd-af20-d7a2f8a479bd";
    test = (s : string) => !/^\s*$/.test(s);
}

export class Trimmed implements Refinement<string> {
    "@nominal" : "a9817926-b7f9-409d-a5b9-370f140eadf3";
    test = (s : string) => /^[^\s].*?[^\s]$/.test(s);
}

export class LowerCase implements Refinement<string> {
    "@nominal" : "d852de1e-e229-4077-a069-26068c804a34";
    test = (s : string) => s === s.toLowerCase();
}

export class UpperCase implements Refinement<string> {
    "@nominal" : "3cb43f6d-77df-4e64-88b8-96d9d3fa7c35";
    test = (s : string) => s === s.toUpperCase();
}
